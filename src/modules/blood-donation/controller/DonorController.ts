import { Request, Response } from "express";
import DonorService from "../services/DonorService";
import StandardResponse from "../../../utils/StandardResponse";
import DonorValidator from "../validators/DonorValidator";

export default class DonorController {
  public static async getAll(req: Request, res: Response) {
    const query = req.query as any;
    const donors = await DonorService.getDonors(query);
    
    if (req.get("HX-Request") === "true") {
      return res.render("partials/donor-list", { donors: Array.isArray(donors) ? donors : donors.docs || [] });
    }
    
    return StandardResponse.successResponse(res, "Donors fetched", donors, 200);
  }

  public static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const donor = await DonorService.getDonorById(id as unknown as string);
    if (!donor) {
      return StandardResponse.errorResponse(res, "Donor not found", 404);
    }
    return StandardResponse.successResponse(res, "Donor fetched", donor, 200);
  }

  public static async create(req: Request, res: Response) {
    const input = req.body;
    const validationError = DonorValidator.createDonor(input);
    if (validationError) {
      return StandardResponse.errorResponse(res, validationError, 422);
    }

    const { data, error } = await DonorService.createDonor(input);
    if (error) {
      return StandardResponse.errorResponse(res, error, 400);
    }

    return StandardResponse.successResponse(res, "Donor created", data, 201);
  }

  public static async update(req: Request, res: Response) {
    const { id } = req.params;
    const input = req.body;

    const validationError = DonorValidator.updateDonor(input);
    if (validationError) {
      return StandardResponse.errorResponse(res, validationError, 422);
    }

    await DonorService.updateDonor(id as unknown as string, input);
    return StandardResponse.successResponse(res, "Donor updated", {}, 200);
  }
}
