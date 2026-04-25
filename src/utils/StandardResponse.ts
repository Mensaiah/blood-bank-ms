import { Response } from "express";


// Response Code
// Response text
// 00
// General Success
// 01
// Created
// 11
// General Error
// 14
// Not Found
// 15
// User Not Verified
// 16
// Unauthorized to perform an action
// 17
// Insufficient coin
// 18
// Insufficient Wallet Balance
// 19
// Invalid Auth Token


export enum StandardReponseCode  {
  GENERIC_SUCCESS = "00",
  CREATED = "01",
  GENERIC_ERROR = "11",
  NOT_FOUND = "14",
  USER_NOT_VERIFIED = "15",
  UNAUTHORIZED = "16",
  INSUFFICIENT_COIN = '17',
  INSUFFICIENT_WALLET_BALANCE = '18',
  INVALID_AUTH_TOKEN = '19'
  

  
}


export default class StandardResponse{

public static async  successResponse(res: Response,message: string, data?:  Record<string, any> | null, code = 200, responseCode = StandardReponseCode.GENERIC_SUCCESS) {
    if (data && 'totalDocs' in data && 'docs' in data)  {
      const { totalDocs: count, docs: rows, } = data;
      const { limit, page } = res.query;
    const totalPages = Math.ceil(count / limit) || 0

        const pagination = {
          total: count,
          totalPages,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 10,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? Number(page) + 1 : null,
        };
       
      res.status(code).send({
            responseCode,
            message,
            data: rows,
            pagination,
        });
        
      } else {
        // Single document case
        
      res.status(code).json({
        responseCode: "00",
            message,
            data
        });

      }
  
  };
  
  public static async  errorResponse (res: Response, error = "Oops. An Error Occurred", code = 500, responseCode = StandardReponseCode.GENERIC_ERROR) {
  
    res.status(code).json({
      responseCode,
      message: error,
      data: null
      });
  };
  
  
}
