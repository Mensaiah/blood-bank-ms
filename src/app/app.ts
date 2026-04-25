import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morganMiddleware from "../middlewares/morgan";
import helmet from "helmet";
import UtilsMiddleware from "../middlewares/utils";
import StandardResponse from "../utils/StandardResponse";
import Logger from "../libs/logger";
import config from "../config";
import router from "../routes";
import fileUpload from "express-fileupload";
import mongoSanitize from "express-mongo-sanitize";
dotenv.config();

const app = express();

app.use(morganMiddleware);
app.use(cors());
app.use(express.json());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(mongoSanitize());

/* The X-Frame-Options header is used to prevent your web pages from being loaded inside a <frame>, <iframe>, <embed>, or <object> of another website. This is particularly useful to prevent clickjacking attacks. */
app.use(helmet.frameguard({ action: "sameorigin" }));

//Adding security headers
app.use((req, res, next) => {
  /*  The Strict-Transport-Security (often referred to as HSTS) header is a security header that instructs browsers to only connect to the server using HTTPS, even if the scheme in the URL is specified as HTTP. This prevents man-in-the-middle attacks that strip SSL/TLS and ensures that the communication remains encrypted. */
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  /* The X-XSS-Protection HTTP header is a security feature that was designed to enable the web browser's built-in reflective cross-site scripting (XSS) protection. It was primarily implemented and used in older versions of Internet Explorer and Chrome.*/
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

/* The X-Powered-By header can reveal information about the technology or framework used by the server, which may provide hints to attackers about potential vulnerabilities. If not required for operational reasons, it's a best practice to remove or modify this header to minimize the information exposure. */
app.use(helmet.hidePoweredBy());

/* The X-Content-Type-Options header is used to prevent browsers from MIME-sniffing a response away from the declared content type. When set to nosniff, it blocks a request if the requested type is "style" and the MIME type is not "text/css", or if the requested type is "script" and the MIME type is not a JavaScript MIME type.*/
app.use(helmet.noSniff());

app.use(UtilsMiddleware.setDefaultsForGET);

app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("App running");
});

app.use("/v1", router);

app.use("*", (req, res) => {
  Logger.warn(`404 Not Found - ${req.originalUrl}`);
  res.status(404).send("404 Not Found");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Logger.error(err.message);
  Logger.error(JSON.stringify(err));
  Logger.error(err.stack);
  const error = config.env.isDevelopment
    ? err.message
    : "Oops. An Error Occurred";

  StandardResponse.errorResponse(res, error, 500);
});
export default app;
