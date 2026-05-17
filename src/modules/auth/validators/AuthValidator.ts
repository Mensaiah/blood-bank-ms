// import { IAddUser } from "../../../interfaces/IUser";
import Joi from 'joi';
import { IChangePasswordInput, IForgotPasswordInput, ILoginInput, IResetPasswordInput, ISignUpInput, IValidateVerificationCodeInput } from "../interfaces/IAuth";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/

export default class AuthValidator {


    public static login(data: ILoginInput) {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        return null

    }


    public static signup(data: ISignUpInput) {

          
        const schema = Joi.object({
            firstName: Joi.string().max(50).required(),
            lastName: Joi.string().max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string()
            .min(8)
            .pattern(passwordRegex)
            .message(
              '"password" must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and  one number'
            ).required(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        return null

    }

 

    public static validateVerificationCode(data: IValidateVerificationCodeInput) {

        const schema = Joi.object({
            code: Joi.string().required(),
            type: Joi.string().valid("email", "phone").required(),
            email: Joi.string().when('type', { is: 'email', then: Joi.required() }),
            phoneNumber: Joi.string().when('type', { is: 'phone', then: Joi.required() }),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        return null

    }


    public static forgotPassword(data: IForgotPasswordInput) {
            
            const schema = Joi.object({
                phoneNumber: Joi.string(),
                email: Joi.string(),
            });
    
            const { error } = schema.validate(data);
            if (error) {
                return error.details[0].message.replace(/['"]/g, "")
            };
            return null

    }

    public static refreshToken(data: IForgotPasswordInput) {
            
        const schema = Joi.object({
            token: Joi.string().required(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        return null

}

    public static resetPassword(data: IResetPasswordInput) {
            
        const schema = Joi.object({
            password: Joi.string()
            .min(8)
            .pattern(passwordRegex)
            .message(
                '"password" must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and  one number'
              ),
            code: Joi.string().required(),
            email: Joi.string().email().required(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        return null

    }
    

    public static changePassword(data: IChangePasswordInput) {
            
        const schema = Joi.object({
            password: Joi.string()
            .min(8)
            .pattern(passwordRegex)
            .message(
                '"password" must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and  one number'
              ),
              oldPassword: Joi.string().required()
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        return null

}
}


