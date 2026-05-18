"use strict";
import FileModel from "../models/file.model";
import Repository from "../../../libs/repository/MongoDBRepository";
import { IFile } from "../interfaces/IFile";
import mongoose from "mongoose";

class FileRepository extends Repository<IFile> {
  private readonly MainModel = FileModel;
  constructor() {
    super(FileModel);
  }
 
 async bulkCreate(files: Partial<IFile>[]) {
    return this.MainModel.insertMany(files);
  }

}

export default new FileRepository();
