import { Router } from "express";
import NotificationController from "../controllers/NotificationController";
import UserMiddleware from "../../../middlewares/user";

const router = Router();

router.get("/history", UserMiddleware.authenticate, NotificationController.getHistory);
router.post("/send", UserMiddleware.authenticate, NotificationController.sendNotification);

export default router;