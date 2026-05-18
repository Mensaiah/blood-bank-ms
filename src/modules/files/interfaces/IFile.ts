import mongoose, { Document } from "mongoose";
import { FileType } from "../../../enum/File";


export  interface WaterMarkOptions {
        
    ratio: number,
    opacity: number,
    dstPath: string,
    text?: string,
    textSize?: number,
    position?: string,


}


export interface IFile extends Document {
    userId: string;
    uniqueId: string;
    name: string;
    type: FileType;
    url: string;
    duration: number;
    width: number;
    height: number;
    format: string;
    size: number;
    metadata: object;
  }