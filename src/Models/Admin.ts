import { model, Schema, Document } from "mongoose";

export interface IAdmin extends Document {
    nombre: string
    apellido: string
    email: string
    password: string
    fecha_registro: Date
  };

const AdminSchema = new Schema({
    nombre:{
        type:String,
        required: true,
        lowercase:true,
        minlength: 4,
        maxlength: 40
    },
    apellido:{
        type:String,
        required: true,
        lowercase:true,
        minlength: 4,
        maxlength: 40
    },
    email:{
        type:String,
        required:true,
        unique: true,
        lowercase:true,
        minlength:6,
        maxlength:120
    },
    password:{
        type:String,
        required:true,
        trim: true,
        minlength:6,
        maxlength:255
    },
    fecha_registro:{
        type:Date,
        default:Date.now,
    }

})

export default model<IAdmin>("Admin", AdminSchema);