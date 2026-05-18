import mongoose, { PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";
import { IDonor } from "../interfaces/IDonor";
import constants from "../../../config/constants";
import GeneralHelpers from "../../../utils/Helpers";
import { BloodGroup } from "../enum/donor.enum";

const DonorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    donationId: { type: String, required: true, unique: true },
    image: { type: String },
    phoneNumber: { type: String, required: true, index: true },
    email: { type: String, required: false, index: true },
    gender: { type: String },
    dateOfBirth: { type: Date },
    address: { type: String },
    occupation: { type: String },
    nextOfKinName: { type: String },
    nextOfKinRelationship: { type: String },
    nextOfKinPhoneNumber: { type: String },
    lastDonated: { type: Date },
    bloodGroup: {

      type: String,
      enum: Object.values(BloodGroup),
      required: true
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

DonorSchema.index({ name: "text", bloodGroup: "text", occupation: "text", address: "text" });

// Add donationId on creation
DonorSchema.pre("validate", function (next) {
  if (this.isNew) {
    this.donationId = `DNR-${GeneralHelpers.generateRandomChar(9).toUpperCase()}`;
  }
  next();
});

DonorSchema.plugin(mongoosePagination);
const Donor = mongoose.model<IDonor, PaginateModel<IDonor>>(
  constants.COLLECTION_NAMES.DONORS,
  DonorSchema
);

export default Donor;
