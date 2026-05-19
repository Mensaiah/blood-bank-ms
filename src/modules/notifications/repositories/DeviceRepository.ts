"use strict";
import DeviceModel from "../models/device.model";
import Repository  from "../../../libs/repository/MongoDBRepository";

class DeviceRepository extends Repository<any> {
 private readonly MainModel = DeviceModel;
    constructor(){
        super(DeviceModel as any);
    }

   
}
 

export default new DeviceRepository()
