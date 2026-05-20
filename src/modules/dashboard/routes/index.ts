import { Router } from "express";
import DashboardController from "../controller/DashboardController";

const router = Router();

router.get("/cards", DashboardController.getCards);
router.get("/menu", DashboardController.getMenu);
router.get("/recent-donations", DashboardController.getRecentDonations);

export default router;
