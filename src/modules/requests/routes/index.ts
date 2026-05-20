import { Router } from "express";
import RequestController from "../controllers/RequestController";
import UserMiddleware from "../../../middlewares/user";

const router = Router();

router.get("/recent", UserMiddleware.authenticate, RequestController.getRecent);
router.post("/", UserMiddleware.authenticate, RequestController.create);

export default router;
