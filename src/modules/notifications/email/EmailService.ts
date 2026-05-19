import nodemailer, { SendMailOptions } from "nodemailer";
import React, { ComponentType, ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

import config from "../../../config";
import { FileLogger } from "../../../libs/logger";
import { EmailTemplateName } from "../../../enum/Notification";
import { EmailTemplates } from "./react";

const TAG = "EmailService";
const Logger = new FileLogger(TAG);

// ---------------- TYPES ----------------

interface TemplateProps {
  [key: string]: string | number | Date | string[] | TemplateProps;
}

type MailOptions = SendMailOptions;

const renderTemplate = <P extends TemplateProps>(
  Component: ComponentType<P>,
  props: P
): string => {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(Component, props) as ReactElement
  );
};

class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    Logger.info("EmailService initialized using AWS SES (NO SMTP)");

    this.transporter = nodemailer.createTransport({
      host: config.env.mailServer.host,
      port: Number(config.env.mailServer.port) || 587,
      secure: Number(config.env.mailServer.port) === 465,
      auth: {
        user: config.env.mailServer.username,
        pass: config.env.mailServer.password,
      },
    });
  }

  public async sendMail<P extends TemplateProps>(
    mailOptions: MailOptions,
    templateName: EmailTemplateName,
    templateProps: P
  ): Promise<any> {
    try {
      Logger.info(`Sending email using template: ${templateName}`);

      const template = EmailTemplates[templateName];
      if (!template) {
        throw new Error(`Email template not found: ${templateName}`);
      }

      const html = renderTemplate(template, templateProps);

      const options: MailOptions = {
        ...mailOptions,
        from: config.env.mailServer.senderId, // must be verified in SES
        html,
      };

      const info = await this.transporter.sendMail(options);
      Logger.info(JSON.stringify(info));
      return info;
    } catch (error) {
      Logger.error("Error sending email", error);
      throw error;
    }
  }

  public async sendRawMail(
    mailOptions: MailOptions,
    html: string
  ): Promise<any> {
    try {
      const options: MailOptions = {
        ...mailOptions,
        from: config.env.mailServer.senderId,
        html,
      };

      const info = await this.transporter.sendMail(options);
      Logger.info(JSON.stringify(info));
      return info;
    } catch (error) {
      Logger.error("Error sending raw email", error);
      throw error;
    }
  }
}

export default EmailService;
