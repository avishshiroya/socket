import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors"
import bodyParser from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv"
import { connectDb } from "./config/db.js";
const app = express();
dotenv.config();
app.use(cookieParser());
app.use(cors())
app.use(bodyParser.json());
app.use(morgan("dev"))
//Db connect
connectDb();
const server = http.createServer(app);
const io = new Server(server);
import Routes from "./routes/index.js";
import { decodeToken } from "./middleware/isAuth.js";
import msgModel from "./models/msg.model.js";
import userModel from "./models/user.model.js";
import broadcastModel from "./models/broadcast.model.js";
import broadMsgModel from "./models/broadcastMsg.model.js";
app.use("/api/v1", Routes);
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "First Routes",
  });
});
var users = {};
io.use(async (socket, next) => {
  // console.log(socket.handshake)
  const token = socket.handshake.headers.token;
  if (!token) {
    io.close();
    return next(new Error("User Not Verified"))
  }
  const JWTtoken = token.split(" ")[1];
  const _id = decodeToken(JWTtoken);
  if (_id) {
    console.log("User Authenticated");
    socket.userId = String(_id)
    return next();
  } else {
    return next(new Error('authentication error'))
  }
})
io.on('connection', async (socket) => {
  console.log("connected")

  const userMessages = await msgModel.find({ $or: [{ sender_id: socket.userId }, { reciever_id: socket.userId }] }, { sender_id: 1, reciever_id: 1, msg: 1 }).sort({ createdAt: -1 }).populate('sender_id', { username: 1, _id: 0 }).populate('reciever_id', { username: 1, _id: 0 });
  if (userMessages) {
    socket.emit('userEnter', userMessages, userMessages.length)
  } else {
    socket.emit('userEnter', "you don't have any chat")
  }
  users[socket.userId] = socket.id
  const user = await userModel.findById(socket.userId);
  socket.broadcast.emit("userEnter", user.username + " online")
  // console.log(users)
  // socket.broadcast.emit('userEnter',"user enter" + socket.id)
  socket.on("message", async ({ to, message }) => {
    const reciever_id = users[to]
    // console.log(reciever_id)
    const messages = new msgModel({
      sender_id: socket.userId, reciever_id: to, msg: message
    })
    const msg = await messages.save();
    socket.to(reciever_id).emit('message', { message_id: msg._id, sender: user.username, message })
    // console.log(to)
    // socket.broadcast.emit("message", {to,message});
  })
  //broadcast data
  socket.on("broadcastData", async (_id) => {
    const sendData = await broadMsgModel.find({ broad_id: _id }, { msg: 1, _id: 0 }).sort({ createdAt: 1 });
    socket.emit("broadcastData", sendData)
  })

  //broadcast channel
  socket.on("broadcast", async ({ name, message }) => {

    const members = await broadcastModel.findOne({ name })
    if(members){
      // console.log(socket.userId, members.userId)
      // console.log(members.userId !== socket.userId)
      if (String(members.userId) == socket.userId) {
        
        console.log(members)
        // console.log(members)
        // io.emit("broadcast",members.membersId)
        //add the user message ****** 
        const messages = new broadMsgModel({
          broad_id: members._id, msg: message
        })
        await messages.save();
        const membersID = members.membersId
        ///send the messages to the broadcast memebers
        membersID.map(async (data, index) => {
          console.log(data)
          let reciever_id = users[data]
          //save the message in the msgModel
          const messages = new msgModel({
            sender_id: socket.userId, reciever_id: data, msg: message
          })
          const msgID = await messages.save();
          socket.to(reciever_id).emit('message', { message_id: msgID._id, sender: user.username, message })
        })
      } else {
        socket.emit('error', "you can't do message in this broadcast channel")
      }}
      else{
        socket.emit('error', "Not have any broadcast channel")
      }
    })
    
    //reply of message ===================
  socket.on("reply", async ({ msg_id, message }) => {
    const msg = await msgModel.findById({ _id: msg_id });
    console.log(msg)
    if (msg) {
      if (String(msg.reciever_id) == socket.userId) {
        const reciever_id = users[msg.sender_id];
        const messageId = new msgModel({
          sender_id: socket.userId,
          reciever_id: msg.sender_id,
          msg: message
        })
        const messsageSave = await messageId.save();
        const msgID = messsageSave._id;
        const saveReply = await msgModel.findOneAndUpdate({ _id: msg._id }, { $push: { reply: msgID } })
        if (saveReply) {
          socket.to(reciever_id).emit('reply', { message_id: msgID, sender: user.username,message: msg.msg, replyMessage: message })
        } else {
          socket.emit('error', "can't save reply to this message")

        }
      } else {
        socket.emit('error', "can't reply to this message")
      }
    } else {
      socket.emit('error', "Message Doesn't Exists")
    }
  })

  socket.on("reaction",async({msg_id,reaction})=>{
    const msg = await msgModel.findById({ _id: msg_id });
    console.log(msg)
    if (msg) {
      if (String(msg.reciever_id) == socket.userId) {
        const reciever_id = users[msg.sender_id];
        const messageId = new msgModel({
          sender_id: socket.userId,
          reciever_id: msg.sender_id,
          msg: reaction
        })
        const messsageSave = await messageId.save();
        const msgID = messsageSave._id;
        const saveReply = await msgModel.findOneAndUpdate({ _id: msg._id }, { $push: { reaction: msgID } })
        if (saveReply) {
          socket.to(reciever_id).emit('reaction', { message_id: msgID, sender: user.username,message: msg.msg, reaction })
        } else {
          socket.emit('error', "can't save reaction to this message")

        }
      } else {
        socket.emit('error', "can't reaction to this message")
      }
    } else {
      socket.emit('error', "Message Doesn't Exists")
    }
  })

  socket.on('disconnect', () => {
    console.log("disconnected")
    delete users[socket.userId];
    socket.broadcast.emit("userEnter", user.username + " offline")
  })

})

















// const users = [];
// io.on("connection", async (socket) => {


//   console.log("connected");
//   console.log(socket.id)
//   const sender_id = String( socket.user);
//   socket.id = sender_id;
//   socket.join('room1');
//   console.log(socket.id)
//     socket.broadcast.emit('userEnter', { sender_id, id: socket.id })

// const userMessages = await msgModel.find({ $or: [{ sender_id: sender_id }, { reciever_id: sender_id }] });
// if (userMessages) {
//   socket.emit('userEnter', userMessages)
// } else {
//   socket.emit('userEnter', "you don't have any chat")
// }

//   socket.on('message', async ({ to, message }) => {
//     if (!message) {
//       console.log("message not available")
//       io.close();
//     }
//     console.log(to)


//     const messages = new msgModel({
//       sender_id, reciever_id: to, msg: message
//     })
//     await messages.save();
//     io.to('room1').emit('message', { from: sender_id, message: message });
//   });

//   socket.on("disconnect", () => {
//     console.log("disconnected");
//   });
// });

// var users = 0;

// io.on("connection", (socket) => {
//   console.log("connected");
//   users++;
//new user
//   socket.emit("newUser", { message: "Hello,New User" });
//for all user who recieve how many user connected now

// socket.broadcast.emit("connectedUser",{message:users +" One new User Connected NOW"})

// setTimeout(()=>{
//    socket.emit('messageSend',{message:" message send from my side"})
// },500)
//   socket.on("send", (data) => {
// console.log(data);
//   });

//   socket.on("disconnect", () => {
// console.log("disconnected");
// users--;
// socket.broadcast.emit("connectedUser",{message:users +" One User disConnected NOW"})
//   });
// });

server.listen(5000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server Created on 5000 PORT");
  }
});
