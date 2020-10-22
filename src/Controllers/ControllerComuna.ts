import { Request, Response } from 'express';
import Comuna from '../Models/Comuna';
import classifyPoint from 'robust-point-in-polygon'
import Joi from '../Middlewares/joi'

export class ComunaController {
    constructor(){}

    public async addComuna(req:Request, res:Response){
        let comuna = await Comuna.findOne({ comuna: req.body.comuna})
        if(comuna) return res.status(400).json({ message:' ya se encuentra registrado'})
        const new_comuna = new Comuna({
            comuna: req.body.comuna,
            phone: req.body.phone, 
            coordinates: req.body.coordinates
        })
        await new_comuna.save((err)=>{
            if(err) return res.status(500).send({ error:[{ message: `Error al crear la comuna: ${err}` }]})

            return res.status(200).send({ mensaje: `La comuna: ${new_comuna.comuna} se ha guardado con exito`})
        })
 
    }
    

    public async CheckPoint(req:Request, res:Response){
        console.log(req.body);
        const {error} = Joi.CheckPoint(req.body) 
        console.log(error);
        if(error)   return res.status(400).send({error:[{ message: error.details}]})
        
        type Point = [number, number];
        let latitude = req.body.latitude
        let longitude = req.body.longitude
        let comuna = await Comuna.find({},{comuna:1,coordinates:2,phone:3})
        let info = {    comuna: "xxx", phone:0   }
        comuna.map(com =>{
            let data:Point[] = com.coordinates.map( e => [e.longitude,e.latitude])
            let a = classifyPoint(data,[longitude,latitude])
            if(a != 1 )
            {
                console.log("La encontro: "+com.comuna+ " Telefono: "+com.phone);
                info = { comuna: com.comuna, phone: com.phone}
                return  info 
            }
        })
        return res.status(200).send(info)
    }
}


export default new ComunaController()