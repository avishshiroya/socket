import msgModel from "../models/msg.model.js"

export const sendMsg = async (data)=>{
    try {
        const {sender_id,reciever_id,msg} = data
        if(!sender_id||!reciever_id||!msg){
            return res.status(401).send({
                success:false,
                message:"details doesn't get"
            })
        }
        const message = await msgModel({

        })
    } catch (error) {
        
    }
}