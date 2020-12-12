import { Request, Response } from 'express';
import User, { IUser }from '../Models/User';
import jwt from 'jsonwebtoken';
import config from '../Config'
import Bcrypt from 'bcrypt'
import Validar from '../Middlewares/joi'
import CtrlMail from '../Controllers/ControllerMail'

export class ResetPasswordController {
    constructor(){}

    public async SendLink(req:Request, res:Response){
        const {error} = Validar.SendLink(req.body)
        if(error) return res.status(400).send({error: error.details})
        
        let Usuario = await User.findOne({ email: req.body.email})
        if (!Usuario) return res.status(400).send({error:[{ message:'Email no pertenece a nuestros registros'}]});
        
        if(!Usuario.fecha_resetpassword)
        {
           
           let token = CreateToken(Usuario)

           let mail = await CtrlMail.ResetPassword(Usuario.email,Usuario.nombre,Usuario.apellido,token)

           if(mail)
            {
                await User.updateOne(Usuario, {
                 fecha_resetpassword: new Date(Date.now())
                },(error)=>{
                     if(error) return res.status(500).send({error:[{ message:`Error al enviar el link: ${error}` }]});
                })
            
                return res.status(200).send({ mensaje:'En los proximos minutos te llegara un email con el restablecimiento de su contraseña'}) 
           }
           else
           {
            return res.status(400).send({error:[{ message:'Error al enviar el email con el restablecimiento de su contraseña'}]});
           }
           
           
        }
        else
        {
            let tiempo =((new Date().getTime())-Usuario.fecha_resetpassword.getTime()) / 1000 / 60
           
            if(tiempo > 5){
                let token = CreateToken(Usuario)

                let mail =  await CtrlMail.ResetPassword(Usuario.email,Usuario.nombre,Usuario.apellido,token)

                if(mail)
                {
                    await User.updateOne(Usuario, {
                        fecha_resetpassword: new Date(Date.now())
                    },(error)=>{
                        if(error) return res.status(500).send({error:[{ message: `Error al enviar el link: ${error}` }]});
                    })

                    return res.status(200).json({ mensaje:'En los proximos minutos te llegara un email con el restablecimiento de su contraseña'}) 
                }
                else
                {
                 return res.status(400).send({error:[{ message:'Error al enviar el email con el restablecimiento de su contraseña'}]});
                }
                
            }
            else return res.status(400).send({error:[{ message: 'Ya se le ha enviado el link a su correo tiene que esperar 5 min para enviar otro'}]}); 
        }
    }

    public async UpdatePassword(req:Request, res:Response){
        if(!req.query.email || !req.query.token) return res.status(400).send({error: 'Link invalido o Ya ha expirado los 5 min'})
        
        const {error} = Validar.ResetPassword(req.query)
        if(error) return res.status(400).send({error: error.details})

        const valido =  VerifyToken(req.query.token.toString())
        if(valido)
        {
            let decode:any = jwt.decode(req.query.token.toString())
            if(decode.email === req.query.email)
            {
                    const {error} = Validar.Password(req.body)
                    if(error) return res.status(400).send({error : error.details});

                    let Usuario = await User.findOne({ email: req.query.email.toString()})
                    if (!Usuario) return res.status(400).json({ error: 'Link invalido o Ya ha expirado los 5 min'});

                    const ClaveEncriptada = await EncryptKey(req.body.password)

                    await User.updateOne(Usuario,{
                            password: ClaveEncriptada,
                            fecha_actualizacion: new Date(Date.now())
                    },(error)=>
                    {
                        if(error) return res.status(500).send( { error: `Error al cambiar la clave: ${error}` })
                    })

                    let mail =  CtrlMail.UpdatePassword(Usuario.email,Usuario.nombre,Usuario.apellido)
                    if(!mail) console.log('Error al enviar el correo de confirmacion de clave')

                    return res.status(200).json({ mensaje: 'Se ha cambiado su clave! '}) 
            }
            return res.status(400).json({ error: 'Link invalido o Ya ha expirado los 5 min'});
        }
        else
        {
            return res.status(400).json({ error: 'Link invalido o Ya ha expirado los 5 min'});
        }
    }

    public async ResetPassword(req:Request, res:Response){
        if(!req.query.email || !req.query.token) return res.status(400).send({error: 'Link invalido o Ya ha expirado los 5 min'})
        
        const {error} = Validar.ResetPassword(req.query)
        if(error) return res.status(400).send({error: error.details})

        const valido =  VerifyToken(req.query.token.toString())
        if(valido)
        {
            let decode:any = jwt.decode(req.query.token.toString())
            if(decode.email === req.query.email)
            {
                return res.status(200).end()
            }
            return res.status(400).json({ error: 'Link invalido o Ya ha expirado los 5 min'});
        }
        else
        {
            return res.status(400).json({ error: 'Link invalido o Ya ha expirado los 5 min'});
        }
    }

}

function CreateToken(user:IUser){
    const token = jwt.sign({ 
        email: user.email 
    }, 
    config.SECRET_TOKEN, 
    {
        algorithm: 'HS256', // Base de Codificacion
        expiresIn: '5 minutes', // Tiempo de Duracion
      });
    return token
}

function VerifyToken(token:string) {
    let bo:boolean = false
    const valido =  jwt.verify(token,config.SECRET_TOKEN,(err, decoded)=> {
        if(!err)  bo = true
      });
      return bo
}

async function  EncryptKey(password:String){
    const salt = await Bcrypt.genSalt(config.Password_Salt)
    const EncryptedKey = await Bcrypt.hash(password, salt)
    return EncryptedKey 
}

export default new ResetPasswordController()