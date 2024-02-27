import mongoose from "mongoose";
import { Schema } from "mongoose";

const broadcastSchema = new Schema({
    userId:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    memebersId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    name:{
        type:String,
        required:true,
        unique:true
    }
},{timestamps:true})

const broadcastModel = await mongoose.model("Broadcast",broadcastSchema)
export default broadcastModel