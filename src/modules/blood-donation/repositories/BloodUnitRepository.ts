"use strict";
import mongoose from "mongoose";
import BloodUnitModel from "../models/bloodUnit.model";
import Repository from "../../../libs/repository/MongoDBRepository";
import { IBloodUnit } from "../interfaces/IBloodUnit";
import type { RootFilterQuery, PaginateOptions } from "mongoose";

class BloodUnitRepository extends Repository<IBloodUnit> {
  private readonly MainModel = BloodUnitModel;

  constructor() {
    super(BloodUnitModel);
  }

  async createBloodUnit(data: Partial<IBloodUnit>, session?: mongoose.ClientSession) {
    return this.MainModel.create([data], { session });
  }

  async getBloodUnitWithDonor(id: string) {
    return this.MainModel.findById(id).populate('donorId').exec();
  }

  async getAllWithDonor(
    condition: RootFilterQuery<IBloodUnit>,
    sort?: Record<string, any>,
    page?: number,
    limit: number = 10
  ) {
    const sortQuery = sort || { expiryDate: 1, collectionDate: 1 };

    if (page) {
      const options: PaginateOptions = {
        sort: sortQuery,
        page,
        limit,
        populate: {
          path: "donorId",
        },
      };
      return this.MainModel.paginate(condition, options);
    }
    
    return this.MainModel.find(condition).populate('donorId').sort(sortQuery).limit(limit);
  }
}

export default new BloodUnitRepository();
