"use strict";
import DonorModel from "../models/donor.model";
import Repository from "../../../libs/repository/MongoDBRepository";
import { IDonor } from "../interfaces/IDonor";
import mongoose from "mongoose";

class DonorRepository extends Repository<IDonor> {
  public readonly MainModel = DonorModel;
  constructor() {
    super(DonorModel);
  }

  async createDonor(data: Partial<IDonor>, session?: mongoose.ClientSession) {
    return this.MainModel.create([data], { session });
  }

}

export default new DonorRepository();
