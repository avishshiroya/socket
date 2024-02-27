import mongoose from "mongoose"
import { Schema } from "mongoose"

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
    }
},{timestamps:true})


const userModel =  mongoose.model("Users",userSchema)
export default userModel