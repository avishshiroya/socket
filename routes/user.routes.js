import  express from "express";
import { userLoginController, userRegisterController, userdeatilController } from "../controllers/user.controllers.js";
import { isAuth } from "../middleware/isAuth.js";
const router = express.Router();

router.post('/register',userRegisterController)
router.post('/login',userLoginController)
router.get('/get',isAuth,userdeatilController)

export default router;