import mongoose, { PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";
import { IAuth } from "../interfaces/IAuth";
import constants from "../../../config/constants";

const AuthSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, },
    userId: { type: String, required: true, index: true  },
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

AuthSchema.plugin(mongoosePagination);
const Auth = mongoose.model<IAuth, PaginateModel<IAuth>>(
  constants.COLLECTION_NAMES.AUTHS,
  AuthSchema
);

export default Auth;