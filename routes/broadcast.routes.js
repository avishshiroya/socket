import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { addBroadcastMember, removeMemberController } from "../controllers/broadcast.controllers.js";
const router= express.Router();

router.post("/add",isAuth,addBroadcastMember)
router.put("/remove/:id",isAuth,removeMemberController)

export default router