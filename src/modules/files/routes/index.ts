import { Router } from "express";
import  FileController  from "../controller/FileController";
import UserMiddleware from "../../../middlewares/user";



const router = Router();

router.post("/upload", UserMiddleware.authenticate, FileController.uploadFile);


router.delete("/", UserMiddleware.authenticate, FileController.deleteFile);



export default router