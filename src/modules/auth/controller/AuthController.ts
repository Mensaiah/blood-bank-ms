import { Request, Response } from "express";
import StandardResponse from "../../../utils/StandardResponse";
import AuthValidator from "../validators/AuthValidator";
import AuthService from "../services/AuthService";



export default class AuthController {


    public static async signup(req: Request, res: Response) {

        const validationError = AuthValidator.signup(req.body);
        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }


        const { data, error } = await AuthService.signup(req.body);

        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
            
        }


        return StandardResponse.successResponse(res, "Signup Successful", data, 200)
    }
    

    public static async login(req: Request, res: Response) {

        const validationError = AuthValidator.login(req.body);
        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }


        const { data, error } = await AuthService.login(req.body);

        if (error) {
            return StandardResponse.errorResponse(res, error, 400) 
            
        }


        return StandardResponse.successResponse(res, "Login Successful", data, 200)
    }

    public static async sendVerificationCode(req: Request, res: Response) {
        const { type } = req.params
        
        if (type !== 'email' && type !== 'phone') {
            return StandardResponse.errorResponse(res, "Invalid notification type either email or phne")
            
        }

        const { data, error } = await AuthService.sendVerificationCode(res.locals.user.id, type);

        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
            
        }


    
        return StandardResponse.successResponse(res, `Verification Code has been sent to your ${type}`, data, 200);

    }
    

    public static async validateVerificationCode(req: Request, res: Response) {


        const validationError = AuthValidator.validateVerificationCode({...req.body, ...req.params});
        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }
        const { type } = req.params
        
        if (type !== 'email' && type !== 'phone') {
            return StandardResponse.errorResponse(res, "Invalid notification type either email or phne")
            
        }


        const { data, error } = await AuthService.validateVerificationCode(res.locals.user.id, req.body.code, type);

        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
            
        }


    
        return StandardResponse.successResponse(res, "Account Verified", data, 200);

    }

    public static async refreshToken(req: Request, res: Response) {
    
        const validationError = AuthValidator.refreshToken(req.body);

        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }

        const { data, error } = await AuthService.refreshToken(req.body.token);

        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
            
        }
    
        return StandardResponse.successResponse(res, "Token Refreshed", data, 200);
    }

    public static async forgotPassword(req: Request, res: Response) {


        const validationError = AuthValidator.forgotPassword(req.body);
        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }

        await AuthService.forgotPassword(req.body);

    
        return StandardResponse.successResponse(res, "If your account exists with you will get a token", {}, 200);

    }



    public static async resetPassword(req: Request, res: Response) {


        const validationError = AuthValidator.resetPassword(req.body);
        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }

        const { data, error } = await AuthService.resetPassword(req.body);

        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
            
        }


    
        return StandardResponse.successResponse(res, "Password Reset Successful", data, 200);

    }

    public static async changePassword(req: Request, res: Response) {
        const { id: userId } = res.locals.user;

        const validationError = AuthValidator.changePassword(req.body);
        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }


        const { data, error } = await AuthService.changePassword(userId, req.body)
        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
        }
        return StandardResponse.successResponse(res, "Password Change Successful", data, 200);
    }
    };