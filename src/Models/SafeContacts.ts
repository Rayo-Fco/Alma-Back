import { model, Schema, Document } from "mongoose";

export interface ISafeContacts extends Document {
    user: Schema.Types.ObjectId;
    contacts:[{ 
        nombre:string,
        telefono: Number,
        date:Date
    }];
    date: Date
  };
  

const SafeContactsSchema = new Schema({
    user:{ 
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    contacts:[{
        nombre:{
            type: String,
            required:true
        },
        telefono:{
            type: Number,
            required:true
        },
        date:{
            type:Date,
            default:Date.now
        }
    }],
    date:{
        type:Date,
        default:Date.now
    }

})



export default model<ISafeContacts>("SafeContacts", SafeContactsSchema);