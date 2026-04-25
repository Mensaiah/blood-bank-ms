import "winston-daily-rotate-file";

import winston from "winston";
import config from "../../config";


const levels = {
  error: 0,
  http: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const level = () => {
 
  return config.env.isDevelopment ? "debug" : "info";
};

const colors = {
  error: "red",
  warn: "yellow",
  http: "magenta",
  info: "green",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.label({ label: "[logs]" }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: any) => `${info.timestamp} [ ${info.level} ]: ${info.message}`
  ),
  winston.format.errors({ stack: true })
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.DailyRotateFile({
    filename: "logs/error.log",
    maxSize: "2m",
    maxFiles: "14d",
  }),
  new winston.transports.DailyRotateFile({
    level: "http",
    filename: "logs/request.log",
    maxSize: "2m",
    maxFiles: "14d",
  }),
  new winston.transports.DailyRotateFile({
    filename: "logs/all.log",
    maxSize: "2m",
    maxFiles: "14d",
  }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
    new winston.transports.Console(),
  ],
});

const customFileLogger = (fileName?: string) => {
  if (!fileName) {
    fileName = "logFile";
  }
  return winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exceptionHandlers: [
      new winston.transports.File({ filename: `logs/${fileName}.log` }),
      new winston.transports.Console(),
    ],
  });
};

export { customFileLogger, Logger };

export default Logger;
