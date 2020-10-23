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