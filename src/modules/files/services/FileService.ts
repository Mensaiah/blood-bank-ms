
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import config from "../../../config";
import Logger from "../../../libs/logger";
import { UploadedFile } from "express-fileupload";
import { MIMETOFILETYPE } from  "../../../config/constants";


// import  fileType from "file-type";

import fs from 'fs';


import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
import { FileType } from "../../../enum/File";
import FileRepository from "../repositories/FileRepository";
import GeneralHelpers from "../../../utils/Helpers";



cloudinary.config({
  secure: true,
  cloud_name: config.env.cloudinary.cloudName,
  api_key: config.env.cloudinary.apiKey,
  api_secret: config.env.cloudinary.apiSecret,
});


const getOverlayIdFromUrl = (url: string) => {
  const u = new URL(url);

  const parts = u.pathname.split("/").filter(Boolean);

  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1 || uploadIndex === parts.length - 1) {
    throw new Error("Invalid Cloudinary URL: missing /upload/ segment");
  }

  let afterUpload = parts.slice(uploadIndex + 1);
  if (afterUpload[0]?.match(/^v\d+$/)) afterUpload = afterUpload.slice(1);

  if (afterUpload.length === 0) {
    throw new Error("Invalid Cloudinary URL: missing public_id after /upload/");
  }

  const last = afterUpload[afterUpload.length - 1];
  afterUpload[afterUpload.length - 1] = last.replace(/\.[^.]+$/, "");

  return afterUpload.join(":");
};

const TAG = "FILESERVICE";
export default class FileService {

  public static async uploadFile(userId: string, uploadedFile: { file: UploadedFile | UploadedFile[] }) {
    console.log('userId:', userId);
    try {
      const files = Array.isArray(uploadedFile.file) ? uploadedFile.file : [uploadedFile.file];
   
      const allMd5 = files.map((file) => file.md5);

      const allSavedFiles = await FileRepository.find({
          uniqueId: {
            $in: allMd5,
          },
          userId, 
      });

      const savedFilesMap = new Map();

      allSavedFiles.map((file) => savedFilesMap.set(file.uniqueId, file));
            
      const result = await Promise.all(files.map(async (file: UploadedFile) => {
        Logger.info(`UPloading ${JSON.stringify(file)}`)

        const fileExists = savedFilesMap.get(file.md5);

        if (fileExists) {
          return fileExists
        }

       
        let type = MIMETOFILETYPE[file.mimetype];

        // if (!type) {
        //   const fileTypeB = await fileType.fromFile(file.tempFilePath);
        //   const mimetype = fileTypeB?.mime as string;
        //   type = MIMETOFILETYPE[mimetype];
        // };

        type FileTypeStr = "video" | "image" | "auto" | "raw"

        const typeToCloudinaryType: Record<FileType, FileTypeStr> = {
          [FileType.AUDIO]: 'video',
          [FileType.IMAGE]: 'image',
          [FileType.DOCUMENT]: 'auto',
          [FileType.VIDEO]: 'video',

        }
            
        const options: UploadApiOptions = {
          use_filename: true,
          unique_filename: true,
          folder: `${config.env.cloudinary.folder}/${type}`,
          resource_type: typeToCloudinaryType[type],
          file_name: `${file.name}_${file.md5}`
        };
            
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        fs.unlinkSync(file.tempFilePath);
        return {
          userId,
          name: file.name,
          uniqueId: file.md5,
          size: file.size,
          type,
          url: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          duration: result.duration,
          metadata: result,
          isNew: true,
        }
      }));

      const newRecords = result.filter((file) => file.isNew);
      if (newRecords.length) {
        await FileRepository.bulkCreate(newRecords)
      };

      return { error: null, data: result }
    } catch (error) {
      console.log('error:', error)
      Logger.error(TAG, error);
      return { error: "An Error Occured During uplload" }
            
    }
  }

  public static async deleteFile(userId: string, input: { url: string }) {

    const file = await FileRepository.findOne({

        url: input.url,
      
    });
 
    if (file && file.userId === userId) { 
      await FileRepository.deleteMany({
      _id: file.id
     })
    }

    return { error: null, data: "File Deleted" }

  }

  public static async uploadBase64File(userId: string, incomingBase64Str: string, addWaterMark = false) {
    try {
      let base64Str = incomingBase64Str;
      // Step 1: Decode base64
      const matches = base64Str.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        base64Str = matches[2];
      }
      
      console.log('base64Str:', !!base64Str)
      const mimeType = 'image/png';
      const buffer = Buffer.from(base64Str, 'base64');
  
      // const ext = (await fileType.fromBuffer(buffer))?.ext || mimeType.split('/')[1];
 
  
      // Step 2: Check file type
      const mimetype = mimeType;
      const type = MIMETOFILETYPE[mimetype];
      // if (!type) {
      //   const fileTypeDetected = await fileType.fromFile(tempFilePath);
      //   type = MIMETOFILETYPE[fileTypeDetected?.mime || ''];
      // }
  
      if (!type) {
        // fs.unlinkSync(tempFilePath);
        return { error: 'Unsupported file type' };
      }
  
      // Step 3: Upload
      const typeToCloudinaryType: Record<FileType, "video" | "image" | "auto" | "raw"> = {
        [FileType.AUDIO]: 'video',
        [FileType.IMAGE]: 'image',
        [FileType.DOCUMENT]: 'auto',
        [FileType.VIDEO]: 'video',
      };
  
      const fileId = GeneralHelpers.generateRandomChar(17)
      const options: UploadApiOptions = {
        use_filename: true,
        unique_filename: true,
        folder: `${config.env.env}/${type}`,
        resource_type: typeToCloudinaryType[type],
        public_id: fileId,
        file_name: `${fileId}`,
        // file_name: `${fileId}.${ext}`,
      };
  

      const dataURI = `data:${mimeType};base64,${base64Str}`;
  
      const result = await cloudinary.uploader.upload(dataURI, options);

  
      const record = {
        userId,
        name: `${fileId}`,
        // name: `${fileId}.${ext}`,
        uniqueId: fileId,
        size: buffer.length,
        type,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
        metadata: result,
      };
  
      await FileRepository.upsert({ uniqueId: fileId }, record);
  
      return { error: null, data: record };
    } catch (error) {
      console.log('error:', error);
      Logger.error(TAG, error);
      return { error: "An error occurred during base64 file upload" };
    }
  }
  
  public static cloudinaryUrlToOverlayId(url: string): string {
    return getOverlayIdFromUrl(url);
  }

}
