"use strict";
import CustomMessageModel from "../models/custom-message.model";
import Repository  from "../../../libs/repository/MongoDBRepository";

class CustomMessageRepository extends Repository<any> {
    constructor(){
                super(CustomMessageModel as any);
    }

   
}
 

export default new CustomMessageRepository()
