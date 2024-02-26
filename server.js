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
  if(!token){
    io.close();
    return next(new Error("User Not Verified"))
  }
  const JWTtoken = token.split("%20")[1];
  const _id = decodeToken(JWTtoken);
  if (_id) {
    console.log("User Authenticated");
    socket.userId = String(_id)
    return next();
  } else {
    return next(new Error('authentication error'))
  }
})
io.on('connection', (socket) => {
  console.log("connected")


  users[socket.userId] = socket.id
  io.emit("userEnter", Object.keys(users))
  // console.log(users)
  // socket.broadcast.emit('userEnter',"user enter" + socket.id)
  socket.on("message", async({ to, message }) => {
    const reciever_id = users[to]
    // console.log(reciever_id)
    socket.to(reciever_id).emit('message', { sender: to, message })
    const messages = new msgModel({
      sender_id:socket.userId, reciever_id: to, msg: message
    })
    await messages.save();
    // console.log(to)
    // socket.broadcast.emit("message", {to,message});
  })
  socket.on('disconnect', () => {
    console.log("disconnected")
    delete users[socket.userId];
    io.emit("userEnter", Object.keys(users))
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

//   const userMessages = await msgModel.find({ $or: [{ sender_id: sender_id }, { reciever_id: sender_id }] });
//   if (userMessages) {
//     socket.emit('userEnter', userMessages)
//   } else {
//     socket.emit('userEnter', "you don't have any chat")
//   }

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
