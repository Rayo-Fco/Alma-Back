import { model, Schema, Document } from "mongoose";

export interface IComuna extends Document {
    comuna: string;
    phone:number;
    coordinates:[{
        latitude:number,
        longitude:number
    }]
  };
  

const ComunaSchema = new Schema({
    comuna:{
        type: String,
        unique: true,
        lowercase:true,
        required: true
    },
    phone:{
        type:Number
    },
    coordinates:[{
            latitude:{
                type: Number,
                required:true
            },
            longitude:{
                type: Number,
                required:true
            }
    }],
    fecha_registro:{
        type:Date,
        default:Date.now
    }

})



export default model<IComuna>("Comuna", ComunaSchema);