
import { UploadedFile } from "express-fileupload";
import {UserInstance} from '../../src/database/models/user'

export { };
declare global {

  namespace NodeJS {
    interface Global {
      io: SocketIO.Server;
    }
  }
  
  namespace Express {
    interface Request {
      isHealthCheck: boolean | null
      allowPass: boolean | null
      admin?: string
      files: {
        file: UploadedFile
    }

      query: {
        limit: number;
        page: number;
        searchText?: string;
      };
    }


    interface Response {
 

      query: {
        limit: string | ParsedQs | (string | ParsedQs)[];
        page: string | ParsedQs | (string | ParsedQs)[];
       
      };
    }
  }
}