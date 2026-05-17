import mongoose, { RootFilterQuery } from "mongoose";
import BloodUnitRepository from "../repositories/BloodUnitRepository";
import { BloodUnitStatus, BLOOD_UNIT_STATUS_FLOW } from "../enum/bloodUnit.enum";
import { IAddBloodUnit, IBloodUnit, IGetBloodUnitsFilter } from "../interfaces/IBloodUnit";
import GeneralHelpers from "../../../utils/Helpers";
import Logger from "../../../libs/logger";

const EXPIRY_FALLBACK_DAYS = 42;

export default class BloodUnitService {
  public static async getBloodUnits(query: IGetBloodUnitsFilter) {
    const { page = 1, limit = 10, sort, donorId, status } = query as any;

    const filterQuery: RootFilterQuery<IBloodUnit> = {};

    if (donorId) {
      filterQuery.donorId = donorId;
    }

    if (status) {
      filterQuery.status = status;
    }

    const sortQuery = sort
      ? GeneralHelpers.formatSortFilter(sort)
      : { expiryDate: 1, collectionDate: 1 };

    return BloodUnitRepository.all(filterQuery, sortQuery, Number(page), Number(limit));
  }

  public static async getFefoInventory(limit = 25) {
    return BloodUnitRepository.find(
      {
        status: BloodUnitStatus.AVAILABLE,
        expiryDate: { $gte: new Date() },
      } as RootFilterQuery<IBloodUnit>,
      { expiryDate: 1, collectionDate: 1 }
    ).limit(limit);
  }

  public static async getBloodUnitById(id: string) {
    return BloodUnitRepository.findById(id);
  }

  private static calculateExpiryDate(collectionDate?: Date | string, expiryDate?: Date | string) {
    if (expiryDate) {
      return new Date(expiryDate);
    }

    const collection = collectionDate ? new Date(collectionDate) : new Date();
    return new Date(collection.getTime() + EXPIRY_FALLBACK_DAYS * 24 * 60 * 60 * 1000);
  }

  public static async createBloodUnit(input: IAddBloodUnit) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

    const payload: Partial<IBloodUnit> = {
      donorId: input.donorId,
      collectionDate: new Date(),
      expiryDate: this.calculateExpiryDate(input.collectionDate, ""),
      status:  BloodUnitStatus.DONATED,
    };

    /// create multiple units if unit count is more than 1
    const bloodUnitsData = [];
    for (let i = 0; i < input.unit; i++) {
      bloodUnitsData.push({
        ...payload,
        unitId: `${input.donorId}-${Date.now()}-${i}`,
      });

    }
      await Promise.all(
        bloodUnitsData.map((unit) => BloodUnitRepository.createBloodUnit(unit, session))
      );

      await session.commitTransaction();

   
    return { data: {}, error: null };
      
    } catch (error) {
      Logger.error("Error creating blood unit(s)", { error });
      await session.abortTransaction();
      return { data: null, error: "Failed to create blood unit(s)" };
      
    }finally {
      session.endSession();
    }

  }

  public static async transitionStatus(id: string, nextStatus: BloodUnitStatus) {
    const bloodUnit = await this.getBloodUnitById(id);

    if (!bloodUnit) {
      return { error: "Specified Blood Unit cannot be found" };
    }

    const allowedTransitions = BLOOD_UNIT_STATUS_FLOW[bloodUnit.status as BloodUnitStatus] || [];
    
    if (!allowedTransitions.includes(nextStatus)) {
      return { error: `Transition from ${bloodUnit.status} to ${nextStatus} is not authorized` };
    }

    bloodUnit.status = nextStatus;
    await bloodUnit.save();

    return { data: bloodUnit };
  }

  public static async markExpiredDueUnits() {
    const now = new Date();
    return BloodUnitRepository.update(
      {
        expiryDate: { $lte: now },
        status: { $ne: BloodUnitStatus.EXPIRED },
      } as RootFilterQuery<IBloodUnit>,
      { status: BloodUnitStatus.EXPIRED }
    );
  }
}
