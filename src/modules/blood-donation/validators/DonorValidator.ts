import Joi from "joi";
import { BloodGroup } from "../enum/donor.enum";

export default class DonorValidator {
  public static createDonor(data: any) {
    const schema = Joi.object({
      name: Joi.string().required(),
      image: Joi.string().uri(),
      phoneNumber: Joi.string()
        .pattern(/^[0-9+()\-\s]+$/)
        .required()
        .messages({ 'string.pattern.base': 'phoneNumber must contain only digits and characters +()- ' }),
      email: Joi.string().email(),
      bloodGroup: Joi.string().valid(...Object.values(BloodGroup)).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      return error.details[0].message.replace(/["']/g, "");
    }
    return null;
  }

  public static updateDonor(data: any) {
    const schema = Joi.object({
      name: Joi.string(),
      image: Joi.string().allow(""),
      phoneNumber: Joi.string().pattern(/^[0-9+()\-\s]+$/).allow(""),
      email: Joi.string().email().allow("", null),
      bloodGroup: Joi.string(),
    });

    const { error } = schema.validate(data);
    if (error) {
      return error.details[0].message.replace(/["']/g, "");
    }
    return null;
  }
}
