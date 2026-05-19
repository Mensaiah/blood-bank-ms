import mongoose, { Document, PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";

interface ICustomMessage extends Document {
  message: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomMessageSchema = new mongoose.Schema({
  message: { type: String,  required: true },
  title: { type: String, index: true },

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
CustomMessageSchema.add({
  deletedAt: { type: Date, default: null }
});

// Add pagination plugin
CustomMessageSchema.plugin(mongoosePagination);

const CustomMessage = mongoose.model<ICustomMessage, PaginateModel<ICustomMessage>>("CustomMessage", CustomMessageSchema);

export default CustomMessage;
