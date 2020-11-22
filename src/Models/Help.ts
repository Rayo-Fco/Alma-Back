import { date, string } from "@hapi/joi";
import { String } from "aws-sdk/clients/acm";
import { model, Schema, Document } from "mongoose";

export interface IHelp extends Document {
    user: Schema.Types.ObjectId;
    puntos: [{
        date: Date,
        token: String,
        comuna:String,
        coordinates: [{
            latitude: number,
            longitude: number
        }]
    }]
};


const HelpSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    puntos:[{
        date: {
            type: Date,
            default:Date.now
        },
        token:{
            type: String,
            required: true
        },
        comuna:{
            type:String,
            required:true
        },
        coordinates: [{
            date: {
                type: Date,
                default: Date.now
            },
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        }]
    }],
    fecha_registro: {
        type: Date,
        default: Date.now
    }

})



export default model<IHelp>("Help", HelpSchema);