import { NextFunction, Request, Response } from "express"
import StandardResponse, { StandardReponseCode } from "../utils/StandardResponse"
import UserService from "../modules/users/services/UserService";
import AuthService from "../modules/auth/services/AuthService";
// import { DecodedTokenPayload } from "../modules/auth/interfaces/IAuth";
// import { UserType } from "../enum";




export default class UserMiddleware {
    public static async  authenticate(req: Request, res: Response, next: NextFunction) {
        const authorization = req.headers.authorization
        
        if (
            !authorization?.startsWith("Bearer")
          ) {
            
            return StandardResponse.errorResponse(res, "Invalid Token Provided", 401, StandardReponseCode.INVALID_AUTH_TOKEN)
        }
        
        const [, token] = authorization.split(" ");
    
        const { valid, expired, decoded } = AuthService.verifyToken(token);

        if (!valid) {
            return StandardResponse.errorResponse(res, "Invalid Token", 401, StandardReponseCode.INVALID_AUTH_TOKEN) 
        }
        
        if (expired) {
            return StandardResponse.errorResponse(res, "Token Expired", 401, StandardReponseCode.INVALID_AUTH_TOKEN);
        };
    
    
    
    
        res.locals.user = decoded;
        next()
    
        
    }



    public static async  authenticateNotEnforced(req: Request, res: Response, next: NextFunction) {
        const authorization = req.headers.authorization
        
        if (
            !authorization?.startsWith("Bearer")
          ) {
            
           return next();
        }
        
        const [, token] = authorization.split(" ");
    
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
 