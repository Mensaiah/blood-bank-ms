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

  public static async getMenu(req: Request, res: Response) {
    const menuItems = DashboardService.getMenuItems();

    if (req.get("HX-Request") === "true") {
      return res.render("partials/sidebar-menu", { menuItems });
    }

    return StandardResponse.successResponse(res, "Menu items fetched", menuItems as any, 200);
  }

  public static async getRecentDonations(req: Request, res: Response) {
    const limit = Number(req.query.limit || 8);
    const rows = await DashboardService.getRecentDonations(limit);

    return StandardResponse.successResponse(res, "Recent donations fetched", rows as any, 200);
  }
}
