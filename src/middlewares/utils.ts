import { NextFunction, Request, Response } from "express";
import { IQuery } from "../interfaces/IGeneric";

export default class UtilsMiddleware {
    
public static  setDefaultsForGET  (req: Request, res: Response, next: NextFunction) {
    // Only apply default values for GET requests
    if (req.method === 'GET') {
        const query = req.query;
       
        // Set defaults if not provided
         req.query.page = query.page  ?? "1";

         req.query.limit = query.limit ?? "10";
       
        res.query = {
            limit: req.query.limit,
            page: req.query.page
        };

      
    }
    
    
    next();
};

} 