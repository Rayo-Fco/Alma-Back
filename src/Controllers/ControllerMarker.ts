import { Request, Response } from 'express';
import Marker, {IMarker}from '../Models/Marker'
import Category from '../Models/Category'
import Joi from '../Middlewares/joi'
import mongoose from 'mongoose'


export class MarkerController {
    constructor(){}

    public async getMarker(req:Request, res:Response){
        let markers = await Marker.find().populate('category',{_id:0, fecha_registro:0})
        return res.status(200).send(markers)
    }

    public async getMarkerPDI(req:Request, res:Response){
         let marker = await Marker.aggregate([
             {
               $lookup:
                 {
                   from: "categories",
                   localField: "category",
                   foreignField: "_id",
                   as: "category"
                 }
            },{
                $project:
                {
                    _id:0,
                    category:{_id:0, fecha_registro:0}
                }
            },{
                $match:
                {
                     'category.name': "pdi"
                }
            }   
         ]);
         return res.status(200).send(marker)
    }
    public async getMarkerComisaria(req:Request, res:Response){
        let marker = await Marker.aggregate([
            {
              $lookup:
                {
                  from: "categories",
                  localField: "category",
                  foreignField: "_id",
                  as: "category"
                }
           },{
               $project:
               {
                   _id:0,
                   category:{_id:0, fecha_registro:0}
               }
           },{
               $match:
               {
                    'category.name': "comisaria"
               }
           }   
        ]);
        return res.status(200).send(marker)
    }

    public async addMarker(req:Request, res:Response):Promise<any>{
        // validar el user
        const {error} = Joi.Marker(req.body) 
        if(error)
        {
            return res.status(400).send({error:[{ message: error.details}]})
        }
        else
        {
            if(!mongoose.Types.ObjectId.isValid(req.body.category)) 
            {
                return res.status(400).json({error:[{ message: `La categoria es invalida`}]});  
            }
            else
            {
                let category = await Category.findById(req.body.category)
                if(!category)
                {
                    return res.status(400).json({error:[{ message: `La categoria no existe`}]});
                }
                else
                {
                    let pin = await Marker.findOne({ latitude:req.body.latitude, longitude:req.body.longitude })
                    if(pin) return res.status(400).json({error:[{ message: `Las coordenadas ya se encuentran registradas`}]});
                    const marker = new Marker({
                        category: req.body.category,
                        title: req.body.title,
                        latitude: req.body.latitude,
                        longitude: req.body.longitude,
                    })
                    await marker.save(async (error,data)=>{
                        if (error){
                            return res.status(500).send({error:[{ message: `Error al crear el marcador: ${error}` }]})
                        }
                         return res.status(200).send({ message:"Marcador agregado con exito" })
            
                    })
                }
                
            }
        }
    }

}




export default new MarkerController()