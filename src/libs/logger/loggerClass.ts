import { customFileLogger, Logger } from "./winston";

class FileLogger {
  _filename: string;
  _logToFile: boolean;

  constructor(fileName: string, logToFile?: boolean ) {
    this._filename = fileName;
    this._logToFile = !!logToFile;
  }

  _fileLogger() {
    return this._logToFile ? customFileLogger(this._filename) : null;
  }

  info(message: string, ...meta: any[]) {
    this._fileLogger()?.info(message);
    Logger.info(`${this._filename}:: ${message}`, ...meta);
  }

  warn(message: string, ...meta: any[]) {
    this._fileLogger()?.warn(message);
    Logger.warn(`${this._filename}:: ${message}`, ...meta);
  }

  error(message: string, ...meta: any[]) {
    this._fileLogger()?.error(message);
    Logger.error(`${this._filename}:: ${message}`, ...meta);
  }
}

export default FileLogger;
