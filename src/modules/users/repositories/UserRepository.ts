"use strict";
import UserModel from "../models/user.model";
import Repository from "../../../libs/repository/MongoDBRepository";
import { IUser } from "../interfaces/IUser";
import mongoose, { PaginateModel, PaginateOptions, RootFilterQuery } from "mongoose";

class UserRepository extends Repository<IUser> {
  private readonly MainModel = UserModel;
  constructor() {
    super(UserModel);
  }
  async createUser(
    data: Partial<IUser>,
    session?: mongoose.ClientSession
  ): Promise<IUser[]> {
    return this.MainModel.create([data], { session });
  }


}

export default new UserRepository();
