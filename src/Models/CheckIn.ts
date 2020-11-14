import { model, Schema, Document } from "mongoose";

export interface ICheckin extends Document {
    user: Schema.Types.ObjectId;
    comuna: String;
    coordinates: [{
        latitude: Number,
        longitude: Number
    }];
    info: [{
        numero_depto: String,
        numero_piso: String,
        extra: String
    }];
    fotos: [];
    date: Date;

};


const CheckinSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    comuna: {
        type: String,
    },
    coordinates: [{
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    }],
    info: [{
        numero_depto: {
            type: String,
        },
        numero_piso: {
            type: String,
        },
        extra: {
            type: String,
        }
    }],
    fotos: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }

})



export default model<ICheckin>("Checkin", CheckinSchema);