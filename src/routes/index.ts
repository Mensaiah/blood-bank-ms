import { Router } from "express";
import "express-async-errors"

import apiRoutes from './api';
import viewRoutes from './view';


const router = Router();

router.use("/api", apiRoutes);
router.use("/", viewRoutes);


// router.use("/", homeRoutes)



export default router;
