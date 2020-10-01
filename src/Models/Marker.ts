import { model, Schema, Document } from "mongoose";

export interface IMarker extends Document {
    category:   Schema.Types.ObjectId,
    title:      String,
    latitude:   Number,
    longitude:  Number,
  };

const MarkerSchema:Schema = new Schema({
    category:{
        type:Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    title:{
        type:String,
        required: true,
        lowercase:true,
        minlength: 4,
        maxlength: 40
    },
    latitude:{
        type:Number,
        required: true,
        trim: true,
        maxlength: 30
    },
    longitude:{
        type:Number,
        required: true,
        trim: true,
        maxlength: 30
    },
    fecha_registro:{
        type:Date,
        default:Date.now,
    }

})

export default model<IMarker>("Marker", MarkerSchema);