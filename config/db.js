import mongoose from "mongoose";

export const connectDb =async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI,{autoIndex:false})
        console.log("Db Connected")
    } catch (error) {
        console.log("Db Not Connected"+error);
    }
}