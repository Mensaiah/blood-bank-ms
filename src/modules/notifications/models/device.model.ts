import mongoose, { Document, PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";

interface IDevice extends Document {
  userId: string;
  deviceId: string;
  token: string;
  deviceName: string;
  platform: string;
}

const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  deviceId: { type: String, required: true },
  token: { type: String, required: true },
  deviceName: { type: String, required: true },
  platform: { type: String, required: true },
}, {
  strict: true,
  timestamps: true, 
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Add soft delete field manually
DeviceSchema.add({
  deletedAt: { type: Date, default: null }
});

// Add pagination plugin
DeviceSchema.plugin(mongoosePagination);

const Device = mongoose.model<IDevice, PaginateModel<IDevice>>("Device", DeviceSchema);

export default Device;
