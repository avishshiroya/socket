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
            const updateChannel = await broadcastModel.findByIdAndUpdate({_id:broadcastChannel._id},{$push:{membersId:memberId}})
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
                name,userId:user,membersId:memberId
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
export const removeMemberController = async(req,res)=>{
    try {
        const {member_id} = req.body
        const user = req.user._id;
        if(!user){
            return res.status(401).send({
                success:false,
                message:"User unauthorized"
            })
        }
        const checkMember = await broadcastModel.findOne({_id:req.params.id,membersId:member_id})
        console.log(checkMember)
        if(!checkMember){
            return res.status(401).send({
                success:false,
                message:"Member Not Found"
            })
        }
        const updateMember = await broadcastModel.findByIdAndUpdate(req.params.id,{$pull:{membersId:member_id}});
        if(!updateMember){
            return res.status(401).send({
                success:false,
                message:"User Cannot Update"
            })
        }
        res.status(200).send({
            success:true,
            message:"User Removed SuccessFully",
            updateMember
        })
        } catch (error) {
        console.log(error)
        return res.status(401).send({
            success:false,
            message:"Error in remove member in broadcast API"
        })

    }
}