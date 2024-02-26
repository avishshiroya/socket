import mongoose from "mongoose"
import { Schema } from "mongoose"

const msgSchema = new Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Uers",
        
    },
    reciever_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Uers",
     
    },
    msg:{
        type:String,
        required:true,
    }
})


const msgModel =  mongoose.model("Msgs",msgSchema)
export default msgModel