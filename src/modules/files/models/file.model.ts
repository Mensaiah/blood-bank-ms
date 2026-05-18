import mongoose, { Document, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { FileType } from "../../../enum/File";
import { IFile } from "../interfaces/IFile";
import constants from "../../../config/constants";





const FileSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
    },
    uniqueId: { 
      type: String, 
      required: true, 
    },
    name: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      required: true, 
      enum: Object.values(FileType) 
    },
    url: { 
      type: String, 
      required: true 
    },
    duration: { 
      type: Number, 
      default: 0 
    },
    width: { 
      type: Number, 
      default: 0 
    },
    height: { 
      type: Number, 
      default: 0 
    },
    format: { 
      type: String, 
      required: true 
    },
    size: { 
      type: Number, 
      required: true 
    },
    metadata: { 
      type: mongoose.Schema.Types.Mixed, // Equivalent to JSONB for flexible objects
      required: true, 
      default: {} 
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    strict: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
        delete ret.deletedAt;
      },
      virtuals: true,
    },
    timestamps: true,
  }
);

FileSchema.index({ userId: 1 });
FileSchema.index({ userId: 1, uniqueId: 1 }, { unique: true });


FileSchema.plugin(mongoosePaginate);

const File = mongoose.model<IFile, PaginateModel<IFile>>(
  constants.COLLECTION_NAMES.FILES,
  FileSchema
);

export default File;