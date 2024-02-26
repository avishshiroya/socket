import bcrypt from "bcrypt"
import userModel from "../models/user.model.js"
import  Jwt  from "jsonwebtoken"
export const userRegisterController = async(req,res)=>{
    try {
        const {email,password,username}= req.body
        if(!email||!password||!username){
            return res.status(401).send({
                success:false,
                message:"All Fields required"
            })
        }
        const hashpassword =await bcrypt.hash(password,10)
        if(!hashpassword){
            return res.status(401).send({
                success:false,
                message:"Password Doesn't Hash"
            })
        }
        const user = new userModel({
            email,password:hashpassword,username
        })
        await user.save();
         res.status(200).send({
            success:true,
            message:"User Save",
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send({
            success:false,
            message:"Error In user Register API",
            error
        })
    }
}

export const userLoginController = async(req,res)=>{
    try {
        const {email,password} = req.body
        const checkUser = await userModel.findOne({email});
        if(!checkUser){
            return res.status(401).send({
                success:false,
                message:"User Doesn't Exists",
                checkUser
            })
        }
        if(!email||!password){
            return res.status(401).send({
                success:false,
                message:"Please Provide All Fields"
            })
        }
        const ismatch = bcrypt.compare(password,checkUser.password)
        if(!ismatch){
            return res.status(401).send({
                success:false,
                message:"Password Doesn't Match"
            })
        }
        const JWTtoken = Jwt.sign({_id:checkUser._id},process.env.JWT_SECRET);
        const token = "Bearer "+JWTtoken
        res.status(200).cookie("token",token,{
            maxAge:15*24*60*60*1024
        }).send({
            success:true,
            message:"User login"
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send({
            success:false,
            message:"Error in login controller API",
            error
        })
    }
}

export const userdeatilController = async(req,res)=>{
    try {
        const user = req.user
        if(!user){
            return res.status(401).send({
                success:false,
                message:"User Not authorized"
            })
        }
        res.status(200).send({
            success:true,
            message:"User Detail",
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send({
            success:false,
            message:"error In user detail API",
            error
        })
    }
}