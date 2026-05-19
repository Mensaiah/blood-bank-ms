import mongoose, { PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";
import constants from "../../../config/constants";
import { IBloodUnit } from "../interfaces/IBloodUnit";
import { BloodUnitStatus } from "../enum/bloodUnit.enum";
import { BloodGroup } from "../enum/donor.enum";

const BloodUnitSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: constants.COLLECTION_NAMES.DONORS,
      required: true,
      index: true,
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    unitId: {
      type: String,
      required: true,
      unique: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BloodUnitStatus),
      default: BloodUnitStatus.DONATED,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: Object.values(BloodGroup),
      required: true,
      index: true,
    },
    transactionHistory: {
      type: [
      {
        fromStatus: {
          type: String,
          enum: Object.values(BloodUnitStatus),
          required: true,
        },
        toStatus: {
          type: String,
          enum: Object.values(BloodUnitStatus),
          required: true,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: constants.COLLECTION_NAMES.USERS,
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
      ],
      default: [],
    },
  },
  {
    strict: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.unit_id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
      virtuals: true,
    },
    timestamps: true,
  }
);

BloodUnitSchema.index({ expiryDate: 1, collectionDate: 1 });

BloodUnitSchema.pre("validate", function (next) {
  if (this.expiryDate && this.collectionDate && this.expiryDate < this.collectionDate) {
    next(new Error("expiryDate cannot be earlier than collectionDate"));
    return;
  }
  next();
});

BloodUnitSchema.plugin(mongoosePagination);

const BloodUnit = mongoose.model<IBloodUnit, PaginateModel<IBloodUnit>>(
  constants.COLLECTION_NAMES.BLOOD_UNITS,
  BloodUnitSchema
);

export default BloodUnit;
