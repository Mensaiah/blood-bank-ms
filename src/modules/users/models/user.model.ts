import mongoose, { PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";
import { IUser } from "../interfaces/IUser";
import { UserStatus, UserType } from "../../../enum/User";
import constants from "../../../config/constants";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: UserStatus.ACTIVE,
      enum: Object.values(UserStatus),
    },

    type: {
      type: String,
      required: true,
      default: UserType.USER,
      enum: Object.values(UserType),
    },
    lastLoginAt: { type: Date },
  },
  {
    strict: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      
      },
      virtuals: true,
    },
    timestamps: true,
  }
);




UserSchema.plugin(mongoosePagination);
const User = mongoose.model<IUser, PaginateModel<IUser>>(
  constants.COLLECTION_NAMES.USERS,
  UserSchema
);


export default User;
