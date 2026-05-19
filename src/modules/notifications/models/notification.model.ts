import mongoose, { Document, PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";
import { BloodGroup } from "../../blood-donation/enum/donor.enum";

export type NotificationChannel = "EMAIL" | "SMS";
export type NotificationAudience = "BROADCAST" | "DONOR";
export type NotificationTemplateType = "EMERGENCY_BROADCAST" | "DONOR_BIRTHDAY" | "DONOR_APPEAL";

export interface INotificationLog extends Document {
  sentBy: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  templateType: NotificationTemplateType;
  donorId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhoneNumber?: string;
  bloodGroup?: BloodGroup | "ALL";
  subject?: string;
  message: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new mongoose.Schema(
  {
    sentBy: { type: String, required: true, index: true },
    audience: { type: String, enum: ["BROADCAST", "DONOR"], required: true, index: true },
    channel: { type: String, enum: ["EMAIL", "SMS"], required: true, index: true },
    templateType: {
      type: String,
      enum: ["EMERGENCY_BROADCAST", "DONOR_BIRTHDAY", "DONOR_APPEAL"],
      required: true,
      index: true,
    },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: false, index: true },
    recipientName: { type: String, required: false },
    recipientEmail: { type: String, required: false, index: true },
    recipientPhoneNumber: { type: String, required: false, index: true },
    bloodGroup: { type: String, enum: ["ALL", ...Object.values(BloodGroup)], required: false, index: true },
    subject: { type: String, required: false },
    message: { type: String, required: true },
    status: { type: String, enum: ["SENT", "FAILED", "SKIPPED"], required: true, index: true },
    errorMessage: { type: String, required: false },
  },
  {
    strict: true,
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

NotificationSchema.plugin(mongoosePagination);

const NotificationModel = mongoose.model<INotificationLog, PaginateModel<INotificationLog>>(
  "Notification",
  NotificationSchema
);

export default NotificationModel;