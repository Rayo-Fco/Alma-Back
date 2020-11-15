import { Request, Response } from 'express';
import User, { IUser }from '../Models/User';
import jwt from 'jsonwebtoken';
import config from '../Config'
import Bcrypt from 'bcrypt'
import Validar from '../Middlewares/joi'

export class UserController {
    constructor(){}

    public async LoginIn(req:Request, res:Response){
        const {error} = Validar.Login(req.body) 
        if(error) return res.status(400).send({error:[{ message: 'Email y/o Password son invalidos'}]})
        
        let Usuario = await User.findOne({ email: req.body.email})
        if (!Usuario) return res.status(400).send({error:[{ message: 'Email y/o Password incorrecto'}]});
        
        let ValidarPass = await Bcrypt.compare(req.body.password, Usuario.password)
        if (!ValidarPass) return res.status(400).send({error:[{ message: 'Email y/o Password incorrecto'}]});
        
        return res.status(200).send({ token: CreateToken(Usuario) })
    }

    public async RegisterUser(req:Request, res:Response){
        const {error} = Validar.Register(req.body)
        if(error) return res.status(400).send({error : error.details});

        const rut =  ValidRut(req.body.rut)
        if(!rut) return res.status(400).send({error:[{ message: 'El Rut ingresado es invalido'}]})

        let PreexitenciaEmail = await User.findOne({ email: req.body.email})
        if(PreexitenciaEmail) return res.status(400).send({error:[{ message: 'Email ya esta registrado'}]})
        
        let PreexitenciaRut = await User.findOne({ rut: req.body.rut})
        if(PreexitenciaRut) return res.status(400).send({error:[{ message:'Rut ya esta registrado'}]})

        const ClaveEncriptada = await EncryptKey(req.body.password)

        const user = new User({
            rut: req.body.rut,
            email: req.body.email,
            nombre: req.body.nombre.toUpperCase(),
            apellido: req.body.apellido.toUpperCase(),
            telefono: req.body.telefono,
            password: ClaveEncriptada,
        })

        console.log(user);
        await user.save(async (error,data)=>{
            if (error){
                return res.status(500).send({error:[{ message: `Error al crear el usuario: ${error}` }]})
            }
             return res.status(200).send({ token: CreateToken(user) })

        })
    }

    public async validrut(req:Request, res:Response){
        return ValidRut(req.body.rut) ? res.status(200).send("Verdadero" ) : res.status(200).send("Falso" )

    }

    public async getUserToken(req:Request, res:Response){
        if(req.user)
        {
            //@ts-ignore
            let user = await User.findById(req.user._id,{password:0,fecha_actualizacion:0,__v:0})
            return res.status(200).json(user)
        }
        else
        { 
            return res.status(400).send({ mensaje: 'Usuario invalido'})
        }
    }

    public async updateUser(req:Request, res:Response){
        if (req.user)
        {
            if(req.body.email && req.body.telefono && req.body.password)
            {
                let correo = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i
                let pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
                let tele = /^[1-9]{1}[0-9]{8}$/

                if(correo.test(req.body.email))
                {
                    if(tele.test(req.body.telefono))
                    {
                        if(pass.test(req.body.password))
                        {
                            //@ts-ignore
                            let ValidarPass = await Bcrypt.compare(req.body.password, req.user.password)
                            if (!ValidarPass) return res.status(400).send({error:[{ message: 'Email y/o Password incorrecto'}]});
                            //validar password
                                if(req.body.confirmPassword)
                                {
                                    if(pass.test(req.body.confirmPassword))
                                    {
                                        const ClaveEncriptada = await EncryptKey(req.body.confirmPassword)
                                        //@ts-ignore
                                            const usuario:IUser = req.user
                                            await User.findOneAndUpdate({_id:usuario._id}, {
                                                email:req.body.email,
                                                telefono:req.body.telefono,
                                                password:ClaveEncriptada,
                                                fecha_actualizacion:new Date(Date.now())
                                            },(error)=>{
                                            if(error) return res.status(500).send({error:[{ message:`Error al actualizar el Usuario: ${error}` }]})
                                            return res.status(200).send({ mensaje: "Se a actualizado el usuario con exito"})
                                        
                                        }) 
                                    }
                                    else
                                    {
                                        return res.status(500).send({error:[{ message: 'Error! La nueva contraseña tiene que tener al menos una letra mayuscula, una letra minuscula y un numero, con 6 caracteres como minimo' }]})
                                    }
                                }
                                else
                                {
                                    //@ts-ignore
                                    const usuario:IUser = req.user
                                    await User.findOneAndUpdate({_id:usuario._id}, {
                                        email:req.body.email,
                                        telefono:req.body.telefono,
                                        fecha_actualizacion:new Date(Date.now())
                                    },(error)=>{
                                      if(error) return res.status(500).send({error:[{ message:`Error al actualizar el Usuario: ${error}` }]})
                                      return res.status(200).send({ mensaje: "Se a actualizado el usuario con exito"})
                                  
                                   }) 
                                }
                        }
                        else
                        {
                            return res.status(500).send({error:[{ message: 'Error! Contraseña invalida' }]})
                        }
                    }
                    else
                    {
                        return res.status(500).send({error:[{ message: 'Error! Telefono invalido' }]})
                    }
                }
                else
                {
                    return res.status(500).send({error:[{ message: 'Error! Correo invalido' }]})
                }
            }
            else
            {
                return res.status(500).send({error:[{ message: 'Error! Complete todos los campos' }]})
            }

        }
        else
        {
            return res.status(400).send({ mensaje: 'Usuario invalido' })
        }
    }

}

function CreateToken(user:IUser){
    const token = jwt.sign({ 
        id: user.id, 
        email: user.email 
    }, 
    config.SECRET_TOKEN, 
    {
        algorithm: 'HS256', // Base de Codificacion
        expiresIn: '15 days', // Tiempo de Duracion
      });
    return token
}

const ValidRut = (rut:string) =>{
        let valor,cuerpo,dv,suma,multiplo,index,dvEsperado
        valor = rut.replace('.','');
        valor = valor.replace('.','');
        valor = valor.replace('-','');
        cuerpo = valor.slice(0,-1);
        dv = valor.slice(-1).toUpperCase();
        rut = cuerpo + '-'+ dv
        if(cuerpo.length < 7) { return false;}
        suma = 0;
        multiplo = 2;
        for(let i=1;i<=cuerpo.length;i++) {
            index = multiplo *  parseInt(valor.charAt(cuerpo.length - i))
            suma = suma + index;
            if(multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
        }
        dvEsperado = 11 - (suma % 11);
        dv = (dv == 'K')?10:dv;
        dv = (dv == 0)?11:dv;
        if(dvEsperado != dv) { return false; }
        return true
    
}




async function  EncryptKey(password:String){
    const salt = await Bcrypt.genSalt(config.Password_Salt)
    const EncryptedKey = await Bcrypt.hash(password, salt)
    return EncryptedKey
}

export default new UserController()