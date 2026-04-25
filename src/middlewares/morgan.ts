import { Request } from "express";
import  { DateTime } from "luxon";
import morgan from "morgan";

import Logger from "../libs/logger/winston";

// Override the stream method by telling
// Morgan to use our custom logger instead of the
const stream = {
  // Use the http severity
  write: (message: string) => Logger.http(message),
};

morgan.token("ip", (request: Request) => request.ip);
morgan.token("timestamp", () => DateTime.now().setZone('Nigeria/Lagos').toFormat('yyyy-MM-dd HH:mm:ss'));
// Build the morgan middleware
const morganMiddleware = morgan(
  ":method :url :status -- :response-time ms -- :ip",
  { stream }
);

export default morganMiddleware;
