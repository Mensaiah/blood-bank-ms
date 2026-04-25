import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import GeneralHelpers from "./Helpers";
import Logger from "../libs/logger";
import { response } from "express";
import { format, getUnixTime } from "date-fns";
import ThirdPartyApiCalls from "../externalServices/models/third-party-api-calls.model";

export default class BaseHAxiosInstance {
  axiosInstance: AxiosInstance;
  private secureKeys: string[];

  constructor(payload: {
    baseURL: string;
    headers: Record<string, string>;
    privateKeys?: string;
  }) {
    const { headers, baseURL, privateKeys = "" } = payload;
    this.secureKeys = privateKeys.split(",").map((k) => k.trim());

    this.axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {
        ...headers,
      },
    });

    this.axiosInstance.interceptors.request.use((req) => {
      const config = this.logAxiosRequest(req);
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (res) => {
        const config = this.logAxiosResponse(res);
        return config;
      },
      (error: AxiosError) => {
        this.logAxiosError(error);
        return Promise.reject(error);
      }
    );
  }

  logAxiosRequest(config: InternalAxiosRequestConfig) {
    config.headers = config.headers || {};
    config.headers["Content-Type"] =
      config.headers["Content-Type"] || "application/json";
    const reqId = config.headers.requestId && config.headers.request_id;
    const sessionId = config.headers.sessionId && config.headers.session_id;

    // clone headers & data
    const headersCopy = { ...(config.headers as Record<string, any>) };
    const dataCopy =
      config.data && typeof config.data === "object"
        ? { ...(config.data as Record<string, any>) }
        : config.data;

    // remove secure keys from headers
    this.secureKeys.forEach((key) => {
      if (headersCopy[key]) {
        headersCopy[key] = "[FILTERED]";
      }
    });

    // remove secure keys from body
    if (dataCopy && typeof dataCopy === "object") {
      this.secureKeys.forEach((key) => {
        if (dataCopy[key]) {
          dataCopy[key] = "[FILTERED]";
        }
      });
    }

    // mask secure keys in headers
    this.secureKeys.forEach((key) => {
      if (headersCopy[key]) {
        headersCopy[key] = this.maskValue(String(headersCopy[key]));
      }
    });

    // mask secure keys in body
    if (dataCopy && typeof dataCopy === "object") {
      this.secureKeys.forEach((key) => {
        if (dataCopy[key]) {
          dataCopy[key] = this.maskValue(String(dataCopy[key]));
        }
      });
    }

    const startTime = getUnixTime(new Date())
    // Prepare log payload
    const logPayload = {
      method: config.method?.toUpperCase(),
      endpoint: `${config.baseURL}${config.url}`,
      reqId,
      sessionId,
      headers: headersCopy,
      payload: dataCopy,
      startTime,
    };

    (config as any)._reqInfo = logPayload;

    return config;
  }

  logAxiosResponse(response: AxiosResponse, privateKeys = "") {
    const reqInfo = (response.config as any)._reqInfo || {};
    const responseBody = response.data?.data || response.data || {};
    const endTime = getUnixTime(new Date())


    const duration = !reqInfo.startTime ? 0 : endTime - reqInfo.startTime
    
    const final = {
      type: "External Request",
      ...reqInfo,
      response: responseBody,
      statusCode: response.status,
      endTime,
      duration
    }

    ThirdPartyApiCalls.create(final)

    // Example log
    Logger.info(
      JSON.stringify(final)
    );


    return response;
  }

  logAxiosError(error: AxiosError, privateKeys = "") {
    // Access the original request information stored in the config
    const reqInfo = (error.config as any)?._reqInfo || {};

    // Extract the response data from the error object, if available
    const responseBody = error.response?.data || {};

    const endTime = getUnixTime(new Date())


    const duration = !reqInfo.startTime ? 0 : endTime - reqInfo.startTime

    const final = {
      type: "External Request Error",
      ...reqInfo,
      statusCode: error.response?.status,
      error: responseBody,
      response: responseBody,
      message: error.message,
      endTime,
      duration,
    }
    // Log the error details
    Logger.error(
      JSON.stringify(final)
    );

    ThirdPartyApiCalls.create(final)

    // Re-throw the error so it can be handled by the calling code
    return Promise.reject(error);
  }

  maskValue(value: string): string {
    if (!value || value.length <= 4) {
      return "***"; // too short, just mask fully
    }

    const length = value.length;
    const visible = Math.ceil(length / 6); // show ~1/6 at start & end
    const start = value.slice(0, visible);
    const end = value.slice(-visible);
    const masked = "*".repeat(length - visible * 2);

    return `${start}${masked}${end}`;
  }
}
