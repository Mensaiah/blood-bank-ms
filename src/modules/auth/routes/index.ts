import { Router } from "express";
import  AuthController  from "../controller/AuthController";
import UserMiddleware from "../../../middlewares/user";


const router = Router();

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.post("/refresh-token",  AuthController.refreshToken);

router.post("/send-code/:type", UserMiddleware.authenticate, AuthController.sendVerificationCode);
router.get("/send-code/:type",UserMiddleware.authenticate, AuthController.sendVerificationCode);
router.post("/verify-code/:type", UserMiddleware.authenticate, AuthController.validateVerificationCode);



router.post("/change-password", UserMiddleware.authenticate, AuthController.changePassword);


router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);





export default router