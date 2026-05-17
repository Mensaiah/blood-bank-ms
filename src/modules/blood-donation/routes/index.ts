import { Router } from "express";
import BloodUnitController from "../controller/BloodUnitController";

const router = Router();

router.get("/units", BloodUnitController.getAll);
router.get("/units/fefo", BloodUnitController.getFefo);
router.get("/units/:id", BloodUnitController.getById);
router.post("/units", BloodUnitController.create);
router.patch("/units/:id/status", BloodUnitController.transitionStatus);
router.post("/units/expire-due", BloodUnitController.expireDueUnits);

export default router;
