import mongoose, { RootFilterQuery } from "mongoose";
import BloodUnitRepository from "../repositories/BloodUnitRepository";
import { BloodUnitStatus, BLOOD_UNIT_STATUS_FLOW, USER_ALLOWED_TO_TRANSITION_STATUS } from "../enum/bloodUnit.enum";
import { IAddBloodUnit, IBloodUnit, IGetBloodUnitsFilter } from "../interfaces/IBloodUnit";
import { BloodGroup } from "../enum/donor.enum";
import GeneralHelpers from "../../../utils/Helpers";
import Logger from "../../../libs/logger";
import { UserType } from "../../../enum/User";

const EXPIRY_FALLBACK_DAYS = 42;
const BLOOD_GROUP_GOAL = 200;

export default class BloodUnitService {
  public static async getBloodUnits(query: IGetBloodUnitsFilter) {
    const { page = 1, limit = 10, sort, donorId, status, bloodGroup } = query as any;

    const filterQuery: RootFilterQuery<IBloodUnit> = {};

    if (donorId) {
      filterQuery.donorId = donorId;
    }

    if (status) {
      filterQuery.status = status;
    }

    if (bloodGroup) {
      filterQuery.bloodGroup = bloodGroup;
    }

    const sortQuery = sort
      ? GeneralHelpers.formatSortFilter(sort)
      : { expiryDate: 1, collectionDate: 1 };

    return BloodUnitRepository.getAllWithDonor(filterQuery, sortQuery, Number(page), Number(limit));
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

  public static async getBloodGroupPercentages() {
    const availableByGroup = await BloodUnitRepository.aggregate([
      {
        $match: {
          status: BloodUnitStatus.AVAILABLE,
        },
      },
      {
        $group: {
          _id: "$bloodGroup",
          availableUnits: { $sum: 1 },
        },
      },
    ]);

    const availableMap = new Map<string, number>(
      availableByGroup.map((item: { _id: string; availableUnits: number }) => [item._id, item.availableUnits])
    );

    return Object.values(BloodGroup).map((bloodGroup) => {
      const availableUnits = availableMap.get(bloodGroup) || 0;
      const percentage = Math.min(100, Math.round((availableUnits / BLOOD_GROUP_GOAL) * 100));

      return {
        bloodGroup,
        percentage,
      };
    });
  }

  public static async getBloodUnitById(id: string) {
    return BloodUnitRepository.getBloodUnitWithDonor(id);
  }

  public static calculateExpiryDate(collectionDate?: Date | string, expiryDate?: Date | string) {
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
      donorId: input.donorId as any,
      collectionDate: new Date(),
      expiryDate: this.calculateExpiryDate(input.collectionDate, ""),
      status:  BloodUnitStatus.DONATED,
    };

    /// create multiple units if unit count is more than 1
    const bloodUnitsData = [];
    for (let i = 0; i < input.unit; i++) {
      bloodUnitsData.push({
        ...payload,
        unitId: `BU-${GeneralHelpers.generateRandomChar(8)}`,
      } as any);

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

  public static async transitionStatus(userType: UserType, id: string, nextStatus: BloodUnitStatus, userId: string, userName: string) {
    const bloodUnit = await this.getBloodUnitById(id);

    if (!bloodUnit) {
      return { error: "Specified Blood Unit cannot be found" };
    }

    // Check if the user is allowed to transition to this status
    const userAllowedStatuses = USER_ALLOWED_TO_TRANSITION_STATUS[userType] || [];
    if (!userAllowedStatuses.includes(nextStatus)) {
      return { error: `User type ${userType} is not allowed to transition to ${nextStatus}` };
    }

    // Check if the transition is allowed by the status flow
    const allowedTransitions = BLOOD_UNIT_STATUS_FLOW[bloodUnit.status] || [];
    
    if (!allowedTransitions.includes(nextStatus)) {
      return { error: `Transition from ${bloodUnit.status} to ${nextStatus} is not authorized` };
    }

    const previousStatus = bloodUnit.status;
    bloodUnit.status = nextStatus;

    // Add transaction to history
    bloodUnit.transactionHistory = bloodUnit.transactionHistory || [];
    bloodUnit.transactionHistory.push({
      fromStatus: previousStatus,
      toStatus: nextStatus,
      userId: userId as any,
      userName,
      timestamp: new Date(),
    });

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

  public static getNextAllowedTransitions(currentStatus: BloodUnitStatus, userType: string) {
    // Get the possible transitions from the status flow
    const possibleTransitions = BLOOD_UNIT_STATUS_FLOW[currentStatus] || [];

    // Get the statuses the user is allowed to transition to
    const userAllowedStatuses = USER_ALLOWED_TO_TRANSITION_STATUS[userType as UserType] || [];

    // Filter possibleTransitions to only include those the user is allowed to transition to
    const allowedTransitions = possibleTransitions.filter((status) =>
      userAllowedStatuses.includes(status)
    );

    return {
      currentStatus,
      possibleTransitions,
      userType,
      userAllowedTransitions: userAllowedStatuses,
      allowedTransitions,
    };
  }
}