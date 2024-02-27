import  JWT  from "jsonwebtoken";
import userModel from "../models/user.model.js";
export const isAuth = async (req,res,next)=>{
    try {
        const token = req.headers["token"];
        console.log(token);
        if(!token){
            return res.status(401).send({
                success:false,
                message:"user Not Authenticated"
            })
        }
        const JWTtoken = token.split(" ")[1];
        const isVerify =  JWT.verify(JWTtoken,process.env.JWT_SECRET)
        const user = await userModel.findById({_id:isVerify._id});
        if(!user){
            return res.status(401).send({
                success:false,
                message:"user Not Available"
            })
        }
        req.user = user
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).send({
            success:false,
            message:"Error In user Authentication Midddleware"
        })
    }
}

export const decodeToken = (token)=>{
    try {
        const isVerify =  JWT.verify(token,process.env.JWT_SECRET)
        return isVerify._id
    } catch (error) {
        return null
    }
}