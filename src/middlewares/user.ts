import { NextFunction, Request, Response } from "express"
import StandardResponse, { StandardReponseCode } from "../utils/StandardResponse"
import AuthService from "../modules/auth/services/AuthService";




export default class UserMiddleware {
    public static async  authenticate(req: Request, res: Response, next: NextFunction) {
                const authorization = req.headers.authorization
                const cookieToken = req.cookies?.accessToken;
                const bearerToken = authorization?.startsWith("Bearer") ? authorization.split(" ")[1] : null;
        const token = bearerToken || cookieToken;
        

        const isHtmxRequest = req.get("HX-Request") === "true";
        
        if (!token) {

    
                return res.redirect("/login");
   
                    
            // return StandardResponse.errorResponse(res, "Invalid Token Provided", 401, StandardReponseCode.INVALID_AUTH_TOKEN)
        }
    
        const { valid, expired, decoded } = AuthService.verifyToken(token);

        if (!valid) {

   
                return res.redirect("/login");
            
            // return StandardResponse.errorResponse(res, "Invalid Token", 401, StandardReponseCode.INVALID_AUTH_TOKEN) 
        }
        
        if (expired) {
        
                return res.redirect("/login");
    
            // return StandardResponse.errorResponse(res, "Token Expired", 401, StandardReponseCode.INVALID_AUTH_TOKEN);
        };
    
    
    
    
        res.locals.user = decoded;
        next()
    
        
    }



    public static async  authenticateNotEnforced(req: Request, res: Response, next: NextFunction) {
        const authorization = req.headers.authorization
        const cookieToken = req.cookies?.accessToken;
        const bearerToken = authorization?.startsWith("Bearer") ? authorization.split(" ")[1] : null;
        const token = bearerToken || cookieToken;
        
        if (!token) {
           return next();
        }
    
        const { valid, expired, decoded } = AuthService.verifyToken(token);

        if (!valid) {
            return next();

        }
        
        if (expired) {
            return next();
        };
    
    
    
    
        res.locals.user = decoded;
        next()
    
        
    }





  

}
 