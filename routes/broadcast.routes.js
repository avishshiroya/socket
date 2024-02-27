import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { addBroadcastMember } from "../controllers/broadcast.controllers.js";
const router= express.Router();

router.post("/add",isAuth,addBroadcastMember)

export default router