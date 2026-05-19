import NotificationModel, {
  INotificationLog,
  NotificationAudience,
  NotificationChannel,
  NotificationTemplateType,
} from "../models/notification.model";
import DonorService from "../../blood-donation/services/DonorService";
import EmailService from "../email/EmailService";
import Logger from "../../../libs/logger";
import { BloodGroup } from "../../blood-donation/enum/donor.enum";

export interface ISendNotificationInput {
  audience: NotificationAudience;
  channel: NotificationChannel;
  templateType: NotificationTemplateType;
  donorId?: string;
  bloodGroup?: BloodGroup | "ALL";
  subject?: string;
  message: string;
}

export interface IGetNotificationHistoryFilter {
  page?: number;
  limit?: number;
  channel?: NotificationChannel;
  audience?: NotificationAudience;
  templateType?: NotificationTemplateType;
}

class SmsService {
  public static async send(phoneNumber: string, message: string) {
    Logger.info(`[SMS] Sending to ${phoneNumber}: ${message}`);
    return { success: true };
  }
}

const buildEmergencyEmailTemplate = (title: string, message: string) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
    <h2 style="color:#b91c1c; margin-bottom:8px;">Emergency Blood Bank Broadcast</h2>
    <p style="margin:0 0 12px 0;"><strong>${title}</strong></p>
    <p style="margin:0 0 12px 0;">${message}</p>
    <p style="margin-top:24px;">Thank you for supporting blood donation.</p>
    <p style="margin:0;">Blood Bank Management System</p>
  </div>`;
};

const buildBirthdayEmailTemplate = (name: string, message: string) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
    <h2 style="color:#15803d; margin-bottom:8px;">Happy Birthday, ${name}! 🎉</h2>
    <p style="margin:0 0 12px 0;">${message}</p>
    <p style="margin-top:24px;">Wishing you good health and joy.</p>
    <p style="margin:0;">Blood Bank Management System</p>
  </div>`;
};

const buildDonorAppealEmailTemplate = (title: string, message: string, bloodGroup?: BloodGroup | "ALL") => {
  const groupText = bloodGroup && bloodGroup !== "ALL" ? bloodGroup : "all blood groups";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
    <h2 style="color:#b91c1c; margin-bottom:8px;">Urgent Donor Appeal</h2>
    <p style="margin:0 0 12px 0;"><strong>${title}</strong></p>
    <p style="margin:0 0 12px 0;">We are currently appealing to donors in the <strong>${groupText}</strong> category.</p>
    <p style="margin:0 0 12px 0;">${message}</p>
    <p style="margin-top:24px;">Your donation can help save lives today.</p>
    <p style="margin:0;">Blood Bank Management System</p>
  </div>`;
};

export default class NotificationService {
  private readonly emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  public async getHistory(filter: IGetNotificationHistoryFilter) {
    const { page = 1, limit = 20, channel, audience, templateType } = filter;
    const query: Record<string, any> = {};

    if (channel) query.channel = channel;
    if (audience) query.audience = audience;
    if (templateType) query.templateType = templateType;

    const history = await (NotificationModel as any).paginate(query, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
    });

    return { data: history };
  }

  public async sendNotification(sentBy: string, input: ISendNotificationInput) {
    const { audience, channel, donorId, bloodGroup } = input;

    if (audience === "DONOR" && !donorId) {
      return { error: "donorId is required for donor notification" };
    }

    const donorsData = audience === "DONOR"
    ? [await DonorService.getDonorById(String(donorId))]
    : await this.getAllDonors(bloodGroup);
    
    console.log('donorsData:', donorsData)
    const donors = donorsData.filter(Boolean) as any[];
    console.log('donors:', donors)
    const logs: Array<Partial<INotificationLog>> = [];
    console.log('logs:', logs)

    for (const donor of donors) {
      logs.push(await this.processDonorNotification(sentBy, input, donor, channel));
    }

    if (logs.length) {
      await NotificationModel.insertMany(logs);
    }

    const sentCount = logs.filter((item) => item.status === "SENT").length;
    const failedCount = logs.filter((item) => item.status === "FAILED").length;
    const skippedCount = logs.filter((item) => item.status === "SKIPPED").length;

    return {
      data: {
        total: logs.length,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
      },
    };
  }

  private async processDonorNotification(
    sentBy: string,
    input: ISendNotificationInput,
    donor: any,
    channel: NotificationChannel
  ) {
    try {
      if (channel === "EMAIL") {
        Logger.info(`Processing email notification for donor ${donor?._id} (${donor?.email})`);
        if (!donor?.email) {
          return this.buildLog(sentBy, input, donor, "SKIPPED", "Donor has no email");
        }

        await this.sendEmailToDonor(donor, input);
      }

      if (channel === "SMS") {
        Logger.info(`Processing SMS notification for donor ${donor?._id} (${donor?.phoneNumber})`);
        if (!donor?.phoneNumber) {
          return this.buildLog(sentBy, input, donor, "SKIPPED", "Donor has no phone number");
        }

        await SmsService.send(donor.phoneNumber, input.message);
      }

      return this.buildLog(sentBy, input, donor, "SENT");
    } catch (error: any) {
      return this.buildLog(sentBy, input, donor, "FAILED", error?.message || "Failed to send");
    }
  }

  private async sendEmailToDonor(donor: any, input: ISendNotificationInput) {
    const mailSubject = this.getEmailSubject(input, donor?.name || "Donor");
    const html = this.getEmailHtml(input, donor?.name || "Donor", mailSubject);


    const result = await this.emailService.sendRawMail({ to: donor.email, subject: mailSubject }, html);
    console.log('Email send result:', result)
  }

  private getEmailSubject(input: ISendNotificationInput, donorName: string) {
    if (input.templateType === "DONOR_BIRTHDAY") {
      return `Happy Birthday ${donorName}`;
    }

    if (input.templateType === "DONOR_APPEAL") {
      return input.subject || "Urgent Blood Donor Appeal";
    }

    return input.subject || "Emergency Blood Bank Notification";
  }

  private getEmailHtml(input: ISendNotificationInput, donorName: string, mailSubject: string) {
    if (input.templateType === "DONOR_BIRTHDAY") {
      return buildBirthdayEmailTemplate(donorName, input.message);
    }

    if (input.templateType === "DONOR_APPEAL") {
      return buildDonorAppealEmailTemplate(mailSubject, input.message, input.bloodGroup);
    }

    return buildEmergencyEmailTemplate(mailSubject, input.message);
  }

  private async getAllDonors(bloodGroup?: BloodGroup | "ALL") {
    const donorsPage: any = await DonorService.getDonors({searchText:bloodGroup} as any);
    const donors = Array.isArray(donorsPage) ? donorsPage : (donorsPage?.docs || []);

    if (!bloodGroup || bloodGroup === "ALL") {
      return donors;
    }

    return donors
  }

  private buildLog(
    sentBy: string,
    input: ISendNotificationInput,
    donor: any,
    status: "SENT" | "FAILED" | "SKIPPED",
    errorMessage?: string
  ) {
    return {
      sentBy,
      audience: input.audience,
      channel: input.channel,
      templateType: input.templateType,
      donorId: donor?._id,
      recipientName: donor?.name,
      recipientEmail: donor?.email,
      recipientPhoneNumber: donor?.phoneNumber,
      bloodGroup: input.bloodGroup,
      subject: input.subject,
      message: input.message,
      status,
      errorMessage,
    };
  }
}
