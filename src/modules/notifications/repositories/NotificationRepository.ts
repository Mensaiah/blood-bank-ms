"use strict";
import NotificationModel, { INotificationLog } from "../models/notification.model";
import Repository  from "../../../libs/repository/MongoDBRepository";

class NotificationRepository extends Repository<INotificationLog> {
 private readonly MainModel = NotificationModel;
    constructor(){
        super(NotificationModel);
    }

   
}
 

export default new NotificationRepository()
