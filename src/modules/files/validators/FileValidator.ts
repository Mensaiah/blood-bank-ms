import Joi from 'joi';


export default class FileValidator {

    public static uploadFile(data: any) {
        const schema = Joi.object({
            file: Joi.any().required(),
            name: Joi.string().optional(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
    }


    public static deleteFile(data: any) {
        const schema = Joi.object({
            url: Joi.string().required(),
        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
    }


}