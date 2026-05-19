import { Router } from "express";
import BloodUnitController from "../controller/BloodUnitController";
import DonorController from "../controller/DonorController";
import DonationController from "../controller/DonationController";

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
router.post("/donors/:id", DonorController.update);

// Donations
router.get("/", DonationController.getAll);
router.post("/", DonationController.create);
router.get("/:id", DonationController.getById);

export default router;
