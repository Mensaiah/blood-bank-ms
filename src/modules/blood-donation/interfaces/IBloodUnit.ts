import { Document } from "mongoose";
import { IQuery } from "../../../interfaces/IGeneric";
import { BloodUnitStatus } from "../enum/bloodUnit.enum";

export interface ITransactionHistory {
  fromStatus: BloodUnitStatus;
  toStatus: BloodUnitStatus;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface IBloodUnit extends Document {
  donorId: string;
  unitId: string;
  collectionDate: Date;
  expiryDate: Date;
  status: BloodUnitStatus;
  bloodGroup: string;
  transactionHistory: ITransactionHistory[];
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
  bloodGroup?: string;
}
