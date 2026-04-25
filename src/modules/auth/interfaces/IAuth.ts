
import { Document } from "mongoose";
import { UserType } from "../../../enum/User";

export interface IAuth extends Document {
    id: string,
    username: string,
    password: string,
    userId: string
}


export interface ILoginInput {
    username: string;
    password: string;
};



export interface ISignUpInput {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    country: string;
};


export  interface IValidateVerificationCodeInput {
    code: string;
    phoneNumber: string;
}


export  interface IForgotPasswordInput {
    email: string;
}


export  interface IResetPasswordInput {
    code: string;
    password: string;
    email: string;

}

export interface DecodedTokenPayload {
    id: string;
    type: UserType;

};


export interface IChangePasswordInput {
    oldPassword: string;
    password: string;
}
