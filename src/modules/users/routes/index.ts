import { Router } from "express";
import UserMiddleware from "../../../middlewares/user";
import UserController from "../controller/UserController";



const router = Router();

router.get("/me", UserController.getMe);
router.patch("/", UserController.updateUser);

export default router;
