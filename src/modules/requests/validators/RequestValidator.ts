import Joi from "joi";
import { BloodGroup } from "../../blood-donation/enum/donor.enum";

export default class RequestValidator {
  public static createRequest(data: any) {
    const schema = Joi.object({
      requesterName: Joi.string().min(2).required(),
      requesterHospital: Joi.string().min(2).required(),
      contactPhone: Joi.string().min(7).required(),
      bloodGroup: Joi.string().valid(...Object.values(BloodGroup)).required(),
      units: Joi.number().integer().min(1).required(),
      urgency: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").required(),
      neededBy: Joi.date().optional().allow("", null),
      notes: Joi.string().max(1000).optional().allow("", null),
    });

    const { error } = schema.validate(data);

    if (error) {
      return error.details[0].message.replace(/['"]/g, "");
    }

    return null;
  }
}
