import mongoose, { PaginateModel } from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";
import constants from "../../config/constants";


const ThirdPartyApiCallsSchema = new mongoose.Schema(
  {
    type: { type: String, },
    endpoint: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, },
    response: { type: mongoose.Schema.Types.Mixed, },
    headers: { type: mongoose.Schema.Types.Mixed, },
    statusCode: { type: Number, },
    error: { type: mongoose.Schema.Types.Mixed, },
    duration: { type: Number, },
    startTime: { type: Number, },
    endTime: { type: Number, },
    reqId: { type: String, },
    sessionId: { type: String, },
    message: { type: String,}



  },
  {
    collection: constants.COLLECTION_NAMES.THIRD_PARTY_API_CALLS,
    strict: false,
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

ThirdPartyApiCallsSchema.plugin(mongoosePagination);
const ThirdPartyApiCalls = mongoose.model(
  constants.COLLECTION_NAMES.THIRD_PARTY_API_CALLS,
  ThirdPartyApiCallsSchema
);

export default ThirdPartyApiCalls;
