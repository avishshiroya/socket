import mongoose from "mongoose"
import { Schema } from "mongoose"

const msgSchema = new Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        
    },
    reciever_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
     
    },
    msg:{
        type:String,
        required:true,
    },
    broadcastId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Broadcast"
    }

},{timestamps:true})


const msgModel =  mongoose.model("Msgs",msgSchema)
export default msgModel