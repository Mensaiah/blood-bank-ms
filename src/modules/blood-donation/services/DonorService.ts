import DonorRepository from "../repositories/DonorRepository";
import { IAddDonor, IDonor, IGetDonorsFilter } from "../interfaces/IDonor";
import { IQuery } from "../../../interfaces/IGeneric";
import mongoose, { RootFilterQuery } from "mongoose";
import GeneralHelpers from "../../../utils/Helpers";

export default class DonorService {
  public static async getDonors(query: IGetDonorsFilter) {
    const { page = 1, limit = 10, sort, searchText } = query as any;

    const filterQuery: RootFilterQuery<IDonor> = {};

    if (searchText) {
      filterQuery.$or = [
        { name: new RegExp(searchText, "i") },
        { bloodGroup: new RegExp(searchText, "i") },
      ];
    }

    const sortQuery = GeneralHelpers.formatSortFilter(sort);

    const donors = await DonorRepository.all(filterQuery, sortQuery, Number(page), Number(limit));
    return donors;
  }

  public static async getDonorById(id: string) {
    return DonorRepository.findOne({
      
      $or: [{ _id: id }, { donationId: id }],
    });
  }

  public static async createDonor(input: IAddDonor) {
    const donorArr = await DonorRepository.create(input);
    
  
      
    return { data: donorArr, error: null };
  }

  public static async updateDonor(id: string, data: Partial<IDonor>) {
    const donor = await this.getDonorById(id);

    if (!donor) {
      return { error: "Specified Donor cannot be found" };
    }

    const updated = await DonorRepository.update({ _id: id }, { ...data });
    return { data: updated };
  }
}
