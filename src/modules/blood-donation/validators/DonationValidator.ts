import Joi from 'joi';

export default class DonationValidator {
  public static createDonation(data: any) {
    const schema = Joi.object({
      donorId: Joi.string().required(),
      status: Joi.string().valid('scheduled','completed','cancelled','deferred').allow('', null),
      donationDate: Joi.date().iso().allow(null, ''),
      bloodGroupUnits: Joi.number().integer().min(1).default(1),
      notes: Joi.string().allow('', null),
      collectedBy: Joi.string().allow('', null),
    });

    const { error } = schema.validate(data);
    if (error) return error.details[0].message.replace(/["']/g, '');
    return null;
  }
}
