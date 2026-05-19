import { Document } from "mongoose";
import {  UserStatus, UserType } from "../../../enum/User";
import { IQuery } from "../../../interfaces/IGeneric";

export interface IUser extends Document {
    email: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
  type: UserType;
  lastLoginAt: Date;
  profileImage?: string;
    createdAt: Date;
    updatedAt: Date;

}


export interface IAddUser {
    email: string;
    firstName: string;
    lastName: string;

}



export interface IGetUsersFilter extends IQuery {
  type?: UserType;
  status?: UserStatus;

}


