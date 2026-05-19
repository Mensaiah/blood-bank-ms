
import Joi from 'joi';


export default class CustomMessageValidator {


    public static createMessage(data: {message: string}) {
        const schema = Joi.object({
          
            message: Joi.string().required(),
            title: Joi.string().required(),
            

        });

        const { error } = schema.validate(data);
        if (error) {
            return error.details[0].message.replace(/['"]/g, "")
        };
        

           return null
       
    }



    


}