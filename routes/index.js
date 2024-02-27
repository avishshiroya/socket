import express from "express"
const router = express.Router();
import userRoutes from "./user.routes.js"
import broadcastRoutes from "./broadcast.routes.js"
router.use('/user',userRoutes)
router.use('/broadcast',broadcastRoutes)


export default router