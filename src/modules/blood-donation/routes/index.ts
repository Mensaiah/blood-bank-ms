import { Router } from "express";
import BloodUnitController from "../controller/BloodUnitController";
import DonorController from "../controller/DonorController";

const router = Router();

// Blood Units
router.get("/units", BloodUnitController.getAll);
router.get("/units/fefo", BloodUnitController.getFefo);
router.get("/units/:id", BloodUnitController.getById);
router.post("/units", BloodUnitController.create);
router.patch("/units/:id/status", BloodUnitController.transitionStatus);
router.post("/units/expire-due", BloodUnitController.expireDueUnits);

// Donors
router.get("/donors", DonorController.getAll);
router.get("/donors/:id", DonorController.getById);
router.post("/donors", DonorController.create);
router.patch("/donors/:id", DonorController.update);

export default router;
