import { Request, Response } from 'express';
import Category from '../Models/Category';
import Joi from '../Middlewares/joi'

export class CategoryController {
    constructor() {}
    
    public async getCategory(req:Request, res:Response){
        let categories = await Category.find({},{_id:2,name:1})
        return res.status(200).send(categories)
    }

    public async addCategory(req:Request, res:Response){
        const {error} = Joi.Category(req.body)
        if (error) return res.status(400).send({error: error.details})

        let category = await Category.findOne({ name: req.body.name})
        if (category) return res.status(400).json({ error:[{ message: `La categoria: ${category.name} ya se encuentra registrada`}]});

        const new_category = new Category({
            name: req.body.name
        })
        await new_category.save((err)=>{
            if(err) return res.status(500).send({ error:[{ message: `Error al crear la categoria: ${err}` }]})

            return res.status(200).send({ mensaje: `La categoria: ${new_category.name} se ha guardado con exito`})
        })


    }
   

    

    
    
}



export default new CategoryController()







