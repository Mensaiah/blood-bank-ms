import { Document } from "mongoose";
import { IQuery } from "../../../interfaces/IGeneric";
import { BloodGroup } from "../enum/donor.enum";

export interface IDonor extends Document {
  name: string;
  phoneNumber: string;
  image?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: Date;
  address?: string;
  occupation?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhoneNumber?: string;
  lastDonated?: Date;
  bloodGroup: BloodGroup;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddDonor {
  name: string;
  phoneNumber: string;
  image?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: Date;
  address?: string;
  occupation?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhoneNumber?: string;
  bloodGroup: BloodGroup;
}

export interface IGetDonorsFilter extends IQuery {
  
}
