import mongoose from "mongoose"
import { Schema } from "mongoose"

const broadMsgSchema = new Schema({
    broad_id: {
         type: mongoose.Schema.Types.ObjectId ,
         ref:'Broadcast',
         required:true
        },
        msg:{
            type:String,
            required:true
        }
},{timestamps:true})

const broadMsgModel = mongoose.model('broadMsg',broadMsgSchema)
export default broadMsgModel