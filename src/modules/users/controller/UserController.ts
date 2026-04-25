import { Request, Response } from "express";
import UserService from "../services/UserService";
import StandardResponse from "../../../utils/StandardResponse";
import UserValidator from "../validators/UserValidator";


export default class UserController {
        
    public static async getMe(req: Request, res: Response) {
        const { id } = res.locals.user;
        const user = await UserService.getUserById(id);

            if (!user) {
                return StandardResponse.errorResponse(res, "Not Authorized", 401)
            }
        return StandardResponse.successResponse(res, "User Details", user, 200)

    }

    public static async updateUser(req: Request, res: Response) {
        const { id } = res.locals.user;
        const input = req.body;

        const validationError = UserValidator.updateUser(input);

        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }

      
        const { data: updatedUser, error } = await UserService.updateUser(id, input);
        
        if (error) {
            return StandardResponse.errorResponse(res, error, 400) 
            
        }

        return StandardResponse.successResponse(res, "User Updated Successfully", {}, 200)
    }
}
