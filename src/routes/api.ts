import { Router } from "express";
import "express-async-errors"

import authsRoutes from '../modules/auth/routes';
import donationRoutes from '../modules/blood-donation/routes';
import dashboardRoutes from '../modules/dashboard/routes';

import UserMiddleware from "../middlewares/user";

const router = Router();

router.use("/auth", authsRoutes);
router.use("/donations", UserMiddleware.authenticate, donationRoutes);

router.use("/dashboard", UserMiddleware.authenticate, dashboardRoutes);

// router.use("/", homeRoutes)



export default router;
