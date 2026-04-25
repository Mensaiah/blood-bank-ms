import {
  IAddUser,
  IGetUsersFilter,

  IUser,
} from "../interfaces/IUser";
import UserRepository from "../repositories/UserRepository";
import bcrypt from "bcrypt";
import mongoose, { mongo, RootFilterQuery, SortOrder } from "mongoose";
import { IQuery } from "../../../interfaces/IGeneric";
import GeneralHelpers from "../../../utils/Helpers";
import EncryptService from "../../../libs/encrypt/hash";
import Logger from "../../../libs/logger";
import {

  UserStatus,
} from "../../../enum/User";
import {
  eventEmitter,
  OnEvent,
  registerEventListeners,
} from "../../../libs/event";

;
import { DurationRangeType } from "../../../enum";


export default class UserService {
  constructor() {
    registerEventListeners(this);
  }


  public static async getUsers(query: IGetUsersFilter) {
    const { page, limit, sort, searchText } = query;

    const filterQuery: RootFilterQuery<IUser> = {};

    if (searchText) {
      filterQuery.$or = [
        {
          firstName: new RegExp(searchText, "i"),
        },
        {
          lastName: new RegExp(searchText, "i"),
        },
        {
          email: new RegExp(searchText, "i"),
        },
      ];
    }

    if (query.type) {
      filterQuery.type = query.type;
    }

    if (query.status) {
      filterQuery.status = query.status;
    }

    const sortQuery = GeneralHelpers.formatSortFilter(sort);

    const users = await UserRepository.all(
      filterQuery,
      sortQuery,
      Number(page),
      Number(limit)
    );
    return users;
  }

  public static async getUserById(id: string) {
    return UserRepository.findById(id);
  }

  public static async getUserByEmail(email: string) {
    return UserRepository.findOne({ email: email.trim().toLowerCase() });
  }

  public static async getUserByPhone(phoneNumber: string) {
    return UserRepository.findOne({ phoneNumber });
  }

  public static async createUser(
    input: IAddUser,
    session?: mongoose.ClientSession
  ) {
    try {
      const userArr = await UserRepository.createUser(input, session);
      const user = userArr[0];
      return { data: user, error: null };
    } catch (error) {
      Logger.info("Create user error:", error);
      return { data: null, error: "Failed to create user" };
    }
  }

  public static async updateUser(id: string, data: Partial<IUser>) {
    const user = await this.getUserById(id);

    if (!user) {
      return { error: "Specified User cannot be found" };
    }

    delete data.email;
  

    const updated = await UserRepository.update({ _id: id }, { ...data });


    return { data: updated };
  }

  

  public static async getUserCounts(filter: Record<string, any>) {
    return UserRepository.count({
      ...filter,
    });
  }

  public static async getUserCountsPercentChange(
    duration: { from: DurationRangeType; to: DurationRangeType },
    filter: Record<string, any> = {}
  ) {
    const fromRange = GeneralHelpers.handleDuration(duration.from);
    const toRange = GeneralHelpers.handleDuration(duration.to);

    const [fromCount, toCount] = await Promise.all([
      UserRepository.count({
        ...filter,
        createdAt: {
          $gte: fromRange.startDate,
          $lte: fromRange.endDate,
        },
      }),
      UserRepository.count({
        ...filter,
        createdAt: {
          $gte: toRange.startDate,
          $lte: toRange.endDate,
        },
      }),
    ]);

    const percentChange = GeneralHelpers.calculatePercentChange(
      fromCount,
      toCount
    );

    return percentChange;
  }

  public static async updateUserStatus(userId: string, status: UserStatus) {
    const user = await this.getUserById(userId);

    if (!user) {
      return { error: "Specified User cannot be found" };
    }

    user.status = status;

    await user.save();

    return { data: user };
  }

}

new UserService();
