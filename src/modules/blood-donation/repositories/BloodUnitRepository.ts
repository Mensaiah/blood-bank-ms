"use strict";
import mongoose from "mongoose";
import BloodUnitModel from "../models/bloodUnit.model";
import Repository from "../../../libs/repository/MongoDBRepository";
import { IBloodUnit } from "../interfaces/IBloodUnit";

class BloodUnitRepository extends Repository<IBloodUnit> {
  private readonly MainModel = BloodUnitModel;

  constructor() {
    super(BloodUnitModel);
  }

  async createBloodUnit(data: Partial<IBloodUnit>, session?: mongoose.ClientSession) {
    return this.MainModel.create([data], { session });
  }
}

export default new BloodUnitRepository();
