"use strict";

import config from "../config";
import app from './app'


import { ValidateEnvs } from "../utils/envValidator";
import database from "../infrastructure/database/mongo";
import logger from "../libs/logger";
import CronService from "../modules/cron/services/CronService";
import StandardResponse, { StandardReponseCode } from "../utils/StandardResponse";

let server;
const TAG = "SERVER";

async function startup() {
  
  try {
    await ValidateEnvs();

    database.connect()

     CronService.cronStart()

    app.use("*", (req, res) => {

      logger.warn(`${TAG}:::Route not found: ${req.originalUrl}`);
      return StandardResponse.errorResponse(res, "Route not found", 404, StandardReponseCode.NOT_FOUND);
    });

    server = app.listen(config.env.port, function () {
      logger.info(`${TAG}:::app running on ${config.env.port} on ${config.env.env}`);
    }); 

    
    process.on("uncaughtException", (err) => {
      logger.warn(`${TAG}:::Uncaught Exception!! Shutting down process..`);
      logger.error(err.stack);
    });
    
    process.on("unhandledRejection", (err) => {
      logger.warn(`${TAG}:::Unhandled Rejection!!` + String(err));
    });
    
    process.on("SIGINT", () => {
      logger.info(
        `${TAG}:::Received SIGINT. Terminating Server. \n Press Control-D to exit.`
      );
      database.close()
      process.exit();
    });
  
} catch (error) {
  logger.error(`Error Initiating App: ${error}`);
  
}
}

startup()



export default server;