import Joi from "joi";
import { BloodGroup } from "../enum/donor.enum";

export default class DonorValidator {
  public static createDonor(data: any) {
    const schema = Joi.object({
      name: Joi.string().required(),
      image: Joi.string().uri().allow("", null),
      phoneNumber: Joi.string()
        .pattern(/^[0-9+()\-\s]+$/)
        .required()
        .messages({ 'string.pattern.base': 'phoneNumber must contain only digits and characters +()- ' }),
      email: Joi.string().email(),
      gender: Joi.string().allow(""),
      dateOfBirth: Joi.date(),
      address: Joi.string().allow(""),
      occupation: Joi.string().allow(""),
      nextOfKinName: Joi.string().allow(""),
      nextOfKinRelationship: Joi.string().allow(""),
      nextOfKinPhoneNumber: Joi.string().pattern(/^[0-9+()\-\s]+$/).allow(""),
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
      gender: Joi.string().allow("", null),
      dateOfBirth: Joi.date().allow(null, ""),
      address: Joi.string().allow("", null),
      occupation: Joi.string().allow("", null),
      nextOfKinName: Joi.string().allow("", null),
      nextOfKinRelationship: Joi.string().allow("", null),
      nextOfKinPhoneNumber: Joi.string().pattern(/^[0-9+()\-\s]+$/).allow("", null),
      bloodGroup: Joi.string(),
    });

    const { error } = schema.validate(data);
    if (error) {
      return error.details[0].message.replace(/["']/g, "");
    }
    return null;
  }
}
