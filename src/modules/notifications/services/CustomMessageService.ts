
import { IQuery } from "../../../interfaces/IGeneric";
import CustomMessageRepository from "../repositories/CustomMessageRepository";
export default class CustomMessageService {

    // This service is responsible for managing custom messages used in notifications.
    // It can include methods to create, update, delete, and retrieve custom messages.
    

    public static async getCustomMessageById(id: string) {
   
        const customMessage = await CustomMessageRepository.findById(id);

        
        if (!customMessage) {
            return {error: "Message specified cannot be found"}
        }

        return {data: customMessage};
    }
    

    public static async createCustomMessage(input: {message: string, title: string}) {

       
        
        const newMessage = await CustomMessageRepository.create({message: input.message, title: input.title});
        return {data: newMessage};
    
    }

    public static  async getCustomMessages(filter: IQuery) {
        const { limit, page, searchText } = filter;

        let where: any = {};

        if (searchText) {
            where = {
                $or: [
                    { message: { $regex: searchText, $options: 'i' } },
                    { title: { $regex: searchText, $options: 'i' } }
                ]
            };
    
                
              
        }

        const customMessages = await CustomMessageRepository.all({
            where,
            sort: { createdAt: -1 },
            page,
            limit,
        });

       return {data: customMessages}

    }


    



}