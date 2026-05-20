import { Request, Response } from "express";
import StandardResponse from "../../../utils/StandardResponse";
import RequestValidator from "../validators/RequestValidator";
import RequestService from "../services/RequestService";

class RequestController {
  create = async (req: Request, res: Response) => {
    const validationError = RequestValidator.createRequest(req.body);

    if (validationError) {
      return StandardResponse.errorResponse(res, validationError, 422);
    }

    const requesterId = res.locals.user?.id;
    const { data, error } = await RequestService.createRequest(requesterId, req.body);

    if (error) {
      return StandardResponse.errorResponse(res, error, 400);
    }

    return StandardResponse.successResponse(res, "Blood request created", data, 201);
  };

  getRecent = async (req: Request, res: Response) => {
    const limit = Number(req.query.limit || 20);
    const rows = await RequestService.getRecentRequests(limit);

    return StandardResponse.successResponse(res, "Recent blood requests fetched", rows as any, 200);
  };
}

export default new RequestController();
