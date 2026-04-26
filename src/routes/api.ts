import { Router } from "express";
import "express-async-errors"

import authsRoutes from '../modules/auth/routes';

import UserMiddleware from "../middlewares/user";

const router = Router();

router.use("/auth", authsRoutes);

// router.use("/", homeRoutes)



export default router;
