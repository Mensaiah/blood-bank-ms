"use strict";
import AuthModel from "../models/auth.model";
import Repository from "../../../libs/repository/MongoDBRepository";
import { IAuth } from "../interfaces/IAuth";
import mongoose from "mongoose";

class AuthRepository extends Repository<IAuth> {
  private readonly MainModel = AuthModel;
  constructor() {
    super(AuthModel);
  }

  async createAuth(authData: Partial<IAuth>, session?: mongoose.ClientSession) {
    return this.MainModel.create([authData], session ? { session } : {});
  }

  async findAuthByUsername(username: string) {
    return this.MainModel.findOne({ username: username.toLowerCase() });
  }

  async findAuthByUserId(userId: string) {
    return this.MainModel.findOne({ userId });
  }



  async updatePassword(authId: string, newPassword: string) {
    return this.MainModel.findByIdAndUpdate(
      authId,
      { password: newPassword },
      { new: true }
    );
  }
}


export default new AuthRepository();
