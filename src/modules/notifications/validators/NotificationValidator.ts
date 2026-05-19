import Joi from 'joi';
import { BloodGroup } from '../../blood-donation/enum/donor.enum';

export default class NotificationValidator {

    public static sendNotification(data: any) {
        const schema = Joi.object({
            audience: Joi.string().valid("BROADCAST", "DONOR").required(),
            channel: Joi.string().valid("EMAIL", "SMS").required(),
            templateType: Joi.string().valid("EMERGENCY_BROADCAST", "DONOR_BIRTHDAY", "DONOR_APPEAL").required(),
            donorId: Joi.when("audience", {
                is: "DONOR",
                then: Joi.string().required(),
                otherwise: Joi.string().allow("", null).optional(),
            }),
            bloodGroup: Joi.when("templateType", {
                is: "DONOR_APPEAL",
                then: Joi.string().valid("ALL", ...Object.values(BloodGroup)).allow("", null).optional(),
                otherwise: Joi.string().valid("ALL", ...Object.values(BloodGroup)).allow("", null).optional(),
            }),
            subject: Joi.string().allow("", null).optional(),
            message: Joi.string().required(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "");
        }

        if (data.audience === "BROADCAST" && data.templateType === "DONOR_APPEAL" && !data.bloodGroup) {
            return "bloodGroup is required for broadcast donor appeal";
        }

        return null;
    }
}
