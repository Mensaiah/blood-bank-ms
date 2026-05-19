"use strict";
import DonationModel from "../models/donation.model";
import Repository from "../../../libs/repository/MongoDBRepository";
import { IDonation } from "../interfaces/IDonation";
import mongoose from "mongoose";

class DonationRepository extends Repository<IDonation> {
  private readonly MainModel = DonationModel;
  
  constructor() {
    super(DonationModel);
  }

  async createDonation(data: Partial<IDonation>, session?: mongoose.ClientSession) {
    return this.MainModel.create([data], { session });
  }

  async getDonationsByDonor(donorId: string, limit: number = 10, offset: number = 0) {
    return this.MainModel.find({ donorId })
    //   .populate("bloodUnits")
      .sort({ donationDate: -1 })
      .limit(limit)
      .skip(offset);
  }

  async getRecentDonations(limit: number = 25, offset: number = 0) {
    return this.MainModel.find({})
      .populate('donorId')
      .populate('bloodUnits')
      .sort({ donationDate: -1 })
      .limit(limit)
      .skip(offset);
  }

  async updateDonationWithUnits(
    donationId: string,
    bloodUnitIds: string[],
    session?: mongoose.ClientSession
  ) {
    return this.MainModel.findByIdAndUpdate(
      donationId,
      { $set: { bloodUnits: bloodUnitIds } },
      { new: true, session }
    ).populate("bloodUnits");
  }
}

export default new DonationRepository();
