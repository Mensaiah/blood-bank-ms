import mongoose, { Document } from "mongoose";
import { BloodGroup } from "../../blood-donation/enum/donor.enum";

export type RequestUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RequestStatus = "PENDING" | "APPROVED" | "FULFILLED" | "REJECTED";

export interface IBloodRequest extends Document {
  requestedBy?: string;
  requesterName: string;
  requesterHospital: string;
  contactPhone: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: RequestUrgency;
  neededBy?: Date;
  notes?: string;
  status: RequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const BloodRequestSchema = new mongoose.Schema(
  {
    requestedBy: { type: String, required: false, index: true },
    requesterName: { type: String, required: true },
    requesterHospital: { type: String, required: true, index: true },
    contactPhone: { type: String, required: true, index: true },
    bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true, index: true },
    units: { type: Number, required: true, min: 1 },
    urgency: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true, index: true },
    neededBy: { type: Date, required: false },
    notes: { type: String, required: false },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "FULFILLED", "REJECTED"],
      default: "PENDING",
      required: true,
      index: true,
    },
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

const BloodRequestModel = mongoose.model<IBloodRequest>("BloodRequest", BloodRequestSchema);

export default BloodRequestModel;
