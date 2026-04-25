/* eslint-disable no-undef */

import mongoose, { ClientSession } from "mongoose";
import { FileLogger } from "../../libs/logger";



const TAG = "mongoDB";
const Logger = new FileLogger(TAG);

const mongoUrl = process.env.DB_URL ?? "";

const connect = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.set("debug", true);
    await mongoose.connect(mongoUrl).then(() => {
      Logger.info("Server Database Connected!!!");
    });
  } catch (err: any) {
    Logger.error(err);
    throw err;
  }
};

const close = async () => mongoose.disconnect();



export default { connect, close, };
