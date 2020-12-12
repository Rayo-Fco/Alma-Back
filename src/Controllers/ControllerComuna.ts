import { Request, Response } from 'express';
import Comuna from '../Models/Comuna';
import classifyPoint from 'robust-point-in-polygon'
import Joi from '../Middlewares/joi'


interface comu {
    comuna:string,
    phone:number
}

export class ComunaController {
    constructor(){}

    public async getCoordinates(req:Request, res:Response){
        let comuna = await Comuna.aggregate(
            [ { $match : { comuna : req.body.comuna } } ]
        );
        return res.status(200).json(comuna)
    }

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
        const {error} = Joi.CheckPoint(req.body) 
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
                console.log("--------Validar Comuna------------");
                console.log("Ubicacion  Latitud:"+latitude+"  Longitud:"+longitude)
                console.log("La encontro: "+com.comuna+ " Telefono: "+com.phone);
                console.log("---------------------------------");
                info = { comuna: com.comuna, phone: com.phone}
                return  info 
            }
        })
        return res.status(200).send(info)
    }

    public async getComuna(req:Request, res:Response){
        let comuna = await Comuna.find({},{coordinates:0})
        return res.status(200).send(comuna)
        
 
    }
    

    public async valid_comuna(latitude:any,longitude:any){
        type Point = [number, number];
        let comuna = await Comuna.find({},{comuna:1,coordinates:2,phone:3})
        let info:comu = {    comuna: "xxx", phone:0   }
        comuna.map(com =>{
            let data:Point[] = com.coordinates.map( e => [e.longitude,e.latitude])
            let a = classifyPoint(data,[longitude,latitude])
            if(a != 1 )
            {   
                console.log("--------Validar Comuna------------");
                console.log("Ubicacion  Latitud:"+latitude+"  Longitud:"+longitude)
                console.log("La encontro: "+com.comuna+ " Telefono: "+com.phone);
                console.log("---------------------------------");
                info = { comuna: com.comuna, phone: com.phone}
                return  info 
            }
        })
        return info
    }

}


export default new ComunaController()