import mongoose, { PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";
import { IDonation } from "../interfaces/IDonation";
import constants from "../../../config/constants";
import GeneralHelpers from "../../../utils/Helpers";

const DonationSchema = new mongoose.Schema(
  {
    donorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: constants.COLLECTION_NAMES.DONORS,
      required: true, 
      index: true 
    },
    donationCode: { 
      type: String, 
      required: true, 
      unique: true 
    },
    status: { 
      type: String, 
      default: "completed", 
      enum: ["scheduled", "completed", "cancelled", "deferred"],
      index: true
    },
    donationDate: { 
      type: Date, 
      default: Date.now,
      index: true
    },
    bloodUnits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: constants.COLLECTION_NAMES.BLOOD_UNITS,
      },
    ],
    notes: { 
      type: String 
    },
    collectedBy: { 
      type: String 
    },
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

DonationSchema.index({ donorId: 1, donationDate: -1 });
DonationSchema.index({ status: 1, donationDate: -1 });

// Generate donation code on creation
DonationSchema.pre("validate", function (next) {
  if (this.isNew) {
    this.donationCode = `DND-${GeneralHelpers.generateRandomChar(9).toUpperCase()}`;
  }
  next();
});

DonationSchema.plugin(mongoosePagination);
const Donation = mongoose.model<IDonation, PaginateModel<IDonation>>(
  constants.COLLECTION_NAMES.DONATIONS,
  DonationSchema
);

export default Donation;
