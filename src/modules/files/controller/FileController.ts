import { Request, Response } from "express";
import FileService from "../services/FileService";
import StandardResponse from "../../../utils/StandardResponse";
import FileValidator from "../validators/FileValidator";




export default class FileController {

    

    public static async uploadFile(req: Request, res: Response) {
        const { id } = res.locals.user;
        const body = {
            ...req.body,
            ...req.files
        }
        const validationError = FileValidator.uploadFile(body);

        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }


        const { error, data } = await FileService.uploadFile(id, body);
        
        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
            
        }

        return StandardResponse.successResponse(res, "File Created", data, 200)

      
    }


    public static async deleteFile(req: Request, res: Response) {
        const { id } = res.locals.user;
    
        const validationError = FileValidator.deleteFile(req.body);

        if (validationError) {
            return StandardResponse.errorResponse(res, validationError, 422)
        }


        const { error } = await FileService.deleteFile(id, req.body);
        
        if (error) {
            return StandardResponse.errorResponse(res, error, 400)
            
        }

        return StandardResponse.successResponse(res, "File Deleted", {}, 200)

      
    }




}