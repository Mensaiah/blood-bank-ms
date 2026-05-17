import { Request, Response } from "express";
import StandardResponse from "../../../utils/StandardResponse";
import DashboardService from "../services/DashboardService";

export default class DashboardController {
  public static async getCards(req: Request, res: Response) {
    const cards = await DashboardService.getCards();

    if (req.get("HX-Request") === "true") {
      return res.render("partials/dashboard-cards", { cards });
    }

    return StandardResponse.successResponse(res, "Dashboard cards fetched", cards as any, 200);
  }
}
