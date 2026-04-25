import Joi from 'joi';

import { UserStatus } from "../../../enum/User";

export default class UserValidator {
    static updateUser(input: Record<string, any>)  {
        const schema = Joi.object({
            firstName: Joi.string(),
            lastName: Joi.string(),
            phoneNumber: Joi.string(),
            bio: Joi.string().allow(""),
            address: Joi.string().allow(""),
            profilePicture: Joi.string().uri().allow(""),
            addressLatitude: Joi.number().optional(),
            addressLongitude: Joi.number().optional(),
            city: Joi.string().allow(""),
            state: Joi.string().allow(""),

        });

        const { error } = schema.validate(input);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        return null
      
    }
 
   

    public static updateUserStatus(data: { status: string }) {
        const schema = Joi.object({
            status: Joi.string().valid(UserStatus.ACTIVE, UserStatus.SUSPENDED).required(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        

        return null
        
    };
}
