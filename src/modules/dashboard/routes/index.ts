import { Router } from "express";
import DashboardController from "../controller/DashboardController";

const router = Router();

router.get("/cards", DashboardController.getCards);

export default router;
