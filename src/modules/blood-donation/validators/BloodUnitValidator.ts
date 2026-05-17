import Joi from "joi";
import { BloodUnitStatus } from "../enum/bloodUnit.enum";

export default class BloodUnitValidator {
  public static createBloodUnit(data: any) {
    const schema = Joi.object({
      donorId: Joi.string().required(),
      collectionDate: Joi.date(),
      unit: Joi.number().integer().positive().required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      return error.details[0].message.replace(/["']/g, "");
    }
    return null;
  }

  public static transitionStatus(data: any) {
    const schema = Joi.object({
      status: Joi.string().valid(BloodUnitStatus.SCREENED, BloodUnitStatus.AVAILABLE, BloodUnitStatus.RESERVED, BloodUnitStatus.DISPATCHED, BloodUnitStatus.EXPIRED).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      return error.details[0].message.replace(/["']/g, "");
    }
    return null;
  }
}
