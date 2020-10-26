import { Request, Response } from 'express';
import Admin, { IAdmin }from '../Models/Admin';
import jwt from 'jsonwebtoken';
import config from '../Config'
import Bcrypt from 'bcrypt'
import Validar from '../Middlewares/joi'

class UserController {
    constructor(){}

public async LoginIn(req:Request, res:Response){
    const {error} = Validar.Login(req.body)
    if(error) return res.status(400).send({error: error.details})
    
    let Administrador = await Admin.findOne({ email: req.body.email})
    if (!Administrador) return res.status(400).json({ error: 'Email y/o Password incorrecto'});
    
    let ValidarPass = await Bcrypt.compare(req.body.password, Administrador.password)
    if (!ValidarPass) return res.status(400).json({ error: 'Email y/o Password incorrecto'});
    
    return res.status(200).send({ token: CreateToken(Administrador) })
}

public async RegisterAdmin(req:Request, res:Response){
    const {error} = Validar.Admin(req.body)
    if(error) return res.status(400).send({error : error.details});

    let PreexitenciaEmail = await Admin.findOne({ email: req.body.email})
    if(PreexitenciaEmail) return res.status(400).send({ error: 'Email ya esta registrado'})

    const ClaveEncriptada = await EncryptKey(req.body.password)

    const user = new Admin({
        email: req.body.email,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        password: ClaveEncriptada,
    })

    await user.save(async (error,data)=>{
        if (error){
            return res.status(500).send( { error: `Error al crear el administrador: ${error}` })
        }
            return res.status(200).send({mensaje: 'Administrador Registrado con Exito' })

    })
}

}

function CreateToken(admin:IAdmin){
    const token = jwt.sign({ 
        id: admin.id, 
        email: admin.email 
    }, 
    config.SECRET_TOKEN, 
    {
        algorithm: 'HS256', // Base de Codificacion
        expiresIn: '1 days', // Tiempo de Duracion
      });
    return token
}



async function  EncryptKey(password:String){
    const salt = await Bcrypt.genSalt(config.Password_Salt)
    const EncryptedKey = await Bcrypt.hash(password, salt)
    return EncryptedKey
}

export default new UserController()