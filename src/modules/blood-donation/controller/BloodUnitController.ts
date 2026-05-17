import { Request, Response } from "express";
import BloodUnitService from "../services/BloodUnitService";
import BloodUnitValidator from "../validators/BloodUnitValidator";
import StandardResponse from "../../../utils/StandardResponse";
import { BloodUnitStatus } from "../enum/bloodUnit.enum";

export default class BloodUnitController {
  public static async getAll(req: Request, res: Response) {
    const units = await BloodUnitService.getBloodUnits(req.query as any);
    return StandardResponse.successResponse(res, "Blood units fetched", units, 200);
  }

  public static async getFefo(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const units = await BloodUnitService.getFefoInventory(limit);
    return StandardResponse.successResponse(res, "FEFO inventory fetched", units, 200);
  }

  public static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const unit = await BloodUnitService.getBloodUnitById(id as unknown as string);

    if (!unit) {
      return StandardResponse.errorResponse(res, "Blood unit not found", 404);
    }

    return StandardResponse.successResponse(res, "Blood unit fetched", unit, 200);
  }

  public static async create(req: Request, res: Response) {
    const validationError = BloodUnitValidator.createBloodUnit(req.body);
    if (validationError) {
      return StandardResponse.errorResponse(res, validationError, 422);
    }

    const { data, error } = await BloodUnitService.createBloodUnit(req.body);
    if (error) {
      return StandardResponse.errorResponse(res, error, 400);
    }

    return StandardResponse.successResponse(res, "Blood unit created", data, 201);
  }

  public static async transitionStatus(req: Request, res: Response) {
    const { id } = req.params;
    const validationError = BloodUnitValidator.transitionStatus(req.body);

    if (validationError) {
      return StandardResponse.errorResponse(res, validationError, 422);
    }

    const { data, error } = await BloodUnitService.transitionStatus(id as unknown as  string,   req.body.status as BloodUnitStatus);

    if (error) {
      return StandardResponse.errorResponse(res, error, 400);
    }

    return StandardResponse.successResponse(res, "Blood unit status updated", data, 200);
  }

  public static async expireDueUnits(_: Request, res: Response) {
    await BloodUnitService.markExpiredDueUnits();
    return StandardResponse.successResponse(res, "Expired units processed", {}, 200);
  }
}
