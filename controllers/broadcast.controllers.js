import broadcastModel from "../models/broadcast.model.js";

export const addBroadcastMember = async(req,res)=>{
    try {
        const {name,broadcastChannelId,memberId} = req.body
        const user = req.user._id;
        if(!user){
            return res.status(401).send({
                success:false,
                message:"User unauthorized"
            })
        }
        const broadcastChannel = await broadcastModel.findOne({$or:[{_id:broadcastChannelId || null},{name:name,userId:user}]});
        if(broadcastChannel){
            const updateChannel = await broadcastModel.findByIdAndUpdate({_id:broadcastChannel._id},{$push:{memebersId:memberId}})
            if(!updateChannel){
                return res.status(401).send({
                    success:false,
                    message:"can't add the user in the channel"
                })
            }
            return res.status(200).send({
                success:true,
                message:"User Updated",
                updateChannel
            })
        }
        if(!broadcastChannel){
            const broadcastChannel = new broadcastModel({
                name,userId:user,memebersId:memberId
            })
            await broadcastChannel.save();
            return res.status(200).send({
                success:true,
                message:"Broadcast Channel Made Successfully",
                broadcastChannel
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(401).send({
            success:false,
            message:"Error in update or add Channel"
        })
    }
}