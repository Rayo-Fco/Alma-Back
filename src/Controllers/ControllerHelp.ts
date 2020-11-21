import { Request, Response } from 'express';
import Help from '../Models/Help'
import Joi from '../Middlewares/joi'
import jwt from 'jsonwebtoken';
import { Schema } from 'mongoose';

export class HelpController {
    constructor() { }

    public async addHelp(req: Request, res: Response) {
        if (req.user) {
            const { error } = Joi.Help(req.body)
            if (error) return res.status(400).send({ error: error.details })
            const fecha = new Date(Date.now())
            //@ts-ignore
            const id_user = req.user._id
            const validhelp = await Help.findOne({user:id_user})
            if(validhelp)
            {
                let existe = false
                validhelp.puntos.map((puntos)=>{
                    console.log(( fecha.getTime() -puntos.date.getTime())/ 1000 / 60/60)
                    if(((fecha.getTime() - puntos.date.getTime() )/ 1000/ 60/ 60) < 8){
                        console.log("encontro el dia");
                        existe = true
                        puntos.coordinates.push({
                            latitude:req.body.latitude,
                            longitude:req.body.longitude
                        })
                    }
                })
                if(!existe){
                    console.log("no Existe dia");
                    const token = CreateToken(id_user)
                    validhelp.puntos.push({
                        date:fecha,
                        token: token,
                        coordinates:[{
                            latitude:req.body.latitude,
                            longitude:req.body.longitude
                        }]
                    })
                }
                await validhelp.save((err)=>{
                    if(err) return res.status(500).send({ error:[{ message: `Error al crear la Alerta SOS: ${err}` }]})
                    return res.status(200).send({ mensaje: `La alerta se ha creado exitosamente`})
                })
            }
            else
            {
                
                const token = CreateToken(id_user)
                const newhelp = new Help({
                    user:id_user,
                    puntos:[{
                        token:token,
                        date:fecha,
                        coordinates:[{
                            latitude:req.body.latitude,
                            longitude:req.body.longitude
                        }]
                    }]
                })
                await newhelp.save((err)=>{
                    if(err) return res.status(500).send({ error:[{ message: `Error al crear la Alerta SOS: ${err}` }]})
                    return res.status(200).send({ 
                        mensaje: `La alerta se ha creado exitosamente`,
                        token:token
                })
                })
            }

        }
        else {
            return res.status(400).send({ error: [{ message: `Usuario Invalido` }] })
        }

    }

    public async getHelp(req:Request, res:Response){
        if(!req.query.token) return res.status(400).send({error: 'Link invalido o Ya ha expirado el seguimiento'})
        const { error } = Joi.Token(req.query)
        if (error) return res.status(400).send({ error: error.details })

        if(!VerifyToken(req.query.token.toString())) return res.status(400).send({error:"Link ya expirado duracion maxima 8 horas_"}) 
        
        const valid_toke = await Help.aggregate([
            {
                $lookup:
                {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            }, {
                $project:
                {
                    user: { nombre:1,apellido:1,rut:1,telefono:1},
                    puntos:{
                        $filter: {
                            input: "$puntos",
                            as: "punto",
                            cond: { $gte: [ "$$punto.token", req.query.token ] }
                         },
                    },
                }
            },
            {
                $match:
                {
                    "puntos.token":req.query.token
                }
            }
        ]);
        if(valid_toke.length >0 ){
            let array:any = []
            const fecha = new Date(Date.now())
            valid_toke[0].puntos.map((puntos:any)=>{
                if(((fecha.getTime() - puntos.date.getTime() )/ 1000/ 60/ 60) < 8)
                {
                    array = puntos.coordinates
                }
            })
            if ( array.length > 0 )return res.status(200).json({ user:valid_toke[0].user , coordinates:array})

            return res.status(400).send({error:"Link ya expirado duracion maxima 8 horas"})
        }
        return res.status(400).send({error:"Link invalido"})

    }
}
function VerifyToken(token:string) {
    let bo:boolean = false
    const valido =  jwt.verify(token,"Alerta_Alma",(err, decoded)=> {
        if(!err)  bo = true
      });
      return bo
}

function CreateToken(id:Schema.Types.ObjectId){
    const token = jwt.sign({ 
        id: id, 
    }, 
    "Alerta_Alma", 
    {
        algorithm: 'HS256', // Base de Codificacion
        expiresIn: '8h', // Tiempo de Duracion
      });
    return token
}


export default new HelpController()