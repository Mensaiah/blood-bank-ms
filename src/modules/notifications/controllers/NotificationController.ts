import { Request, Response } from "express";
import NotificationService from "../services/NotificationService";
import StandardResponse from "../../../utils/StandardResponse";
import NotificationValidator from "../validators/NotificationValidator";
class NotificationController {
    private readonly notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    getHistory = async (req: Request, res: Response) => {
        const { data } = await this.notificationService.getHistory(req.query as any);
        return StandardResponse.successResponse(res, "Notifications Retrieved", data, 200);
    };

    sendNotification = async (req: Request, res: Response) => {
        const validationError = NotificationValidator.sendNotification(req.body);

        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422);
        }

        const senderId = res.locals.user?.id;
        const { data, error } = await this.notificationService.sendNotification(senderId, req.body);

        if (error) {
            return StandardResponse.errorResponse(res, error, 400);
        }

        return StandardResponse.successResponse(res, "Notification Sent", data, 200);
    };
}

export default new NotificationController();