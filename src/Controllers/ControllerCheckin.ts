import { Request, Response } from 'express';
import Checkin from '../Models/CheckIn';
import User from '../Models/User'
import Joi from '../Middlewares/joi'
import CtrlComuna from './ControllerComuna'



export class CheckinController {
    constructor(){}
    
    public async addCheckin(req:Request, res:Response){
        console.log(req.body);
        if(req.user)
        {
            //@ts-ignore
            let user = User.findById(req.user._id)
            if(user)
            {
                const {error} = Joi.Checkin(req.body)
                if(error)   return res.status(400).send({error : error.details})

                let fecha = new Date(new Date().setDate(new Date().getDate()-1))
                //@ts-ignore
                const check = await Checkin.find({ user:req.user._id,
                    "date" : { 
                    $lt: new Date(), 
                    $gte: fecha
                  }
                },{})

                if(check.length > 4) return res.status(400).send({error:[{ message: 'Solo puede hacer 5 Check-in por dia, Gracias'}]})


                const comuna = await CtrlComuna.valid_comuna(req.body.latitude,req.body.longitude)
                if(!comuna ) return res.status(400).send({error:[{ message: 'Error, Contactar a soporte'}]})


                const checkin_new = new Checkin({
                    //@ts-ignore
                    user:req.user._id,
                    comuna:comuna.comuna,
                    info:{
                        numero_depto: req.body.numero_depto,
                        numero_piso: req.body.numero_piso,
                        extra:req.body.extra
                    },
                    coordinates:{
                        latitude:req.body.latitude,
                        longitude: req.body.longitude
                    },
                })
                await checkin_new.save((err)=>{
                    if(err) return res.status(500).send({ error:[{ message: `Error al crear el Check in: ${err}` }]})
                    return res.status(200).send({ mensaje: 'Check in Exitoso'})
                })
                
            }
            else
            {
                return res.status(400).send({error:[{ message: 'Error, Usuario invalido'}]})
            }
        }
        else
        {
            return res.status(400).send({error:[{ message: 'Error, Usuario invalido'}]})
        }
    }

    public async getallCheckin(req:Request, res:Response){
        if(req.user)
        {
            
            let check = await Checkin.aggregate([
                {
                $lookup:
                    {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                    }
            },{
                $project:
                {
                    _id:0,
                    user:{_id:0, password:0, fecha_registro:0}
                }
            }
            ]);
            return res.status(200).send(check)
        }
        else
        {
            return res.status(400).send({ mensaje: 'Usuario invalido'})
        }
    }
    
}


export default new CheckinController()