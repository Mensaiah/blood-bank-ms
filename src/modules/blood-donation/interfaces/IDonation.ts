import { Document } from "mongoose";
import { IBloodUnit } from "./IBloodUnit";
import { IDonor } from "./IDonor";
import { IQuery } from "../../../interfaces/IGeneric";

export interface IDonation extends Document {
  donorId: IDonor["_id"];
  donationCode: string;
  status: "scheduled" | "completed" | "cancelled" | "deferred";
  donationDate: Date;
  bloodUnits: IBloodUnit["_id"][];
  notes?: string;
  collectedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateDonation {
  donorId: string;
  status?: "scheduled" | "completed" | "cancelled" | "deferred";
  donationDate?: Date;
  bloodGroupUnits?: number; // number of units to create
  notes?: string;
  collectedBy?: string;
}

export interface IGetDonationsFilter extends IQuery {
  donorId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}
