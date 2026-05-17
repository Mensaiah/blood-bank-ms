import { Document } from "mongoose";
import { IQuery } from "../../../interfaces/IGeneric";
import { BloodUnitStatus } from "../enum/bloodUnit.enum";

export interface IBloodUnit extends Document {
  donorId: string;
  collectionDate: Date;
  expiryDate: Date;
  status: BloodUnitStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddBloodUnit {
  donorId: string;
  collectionDate?: Date | string;
 unit: number;
}

export interface IGetBloodUnitsFilter extends IQuery {
  donorId?: string;
  status?: BloodUnitStatus;
}
