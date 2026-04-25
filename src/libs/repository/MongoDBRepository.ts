import { Model, Document, RootFilterQuery, PaginateModel, PaginateOptions, PipelineStage, UpdateQuery } from "mongoose";

class MongoDBRepository<T extends Document> {
    private readonly Model: Model<T> | PaginateModel<T>;

    constructor(model:Model<T>  | PaginateModel<T>) {
        this.Model = model;
    }

    create(payload: Partial<T>): Promise<T> {
        return this.Model.create(payload);
    }

    async findById(id: string): Promise<T | null> {
    try{
        
        return await this.Model.findById(id).exec();
    } catch (error: any) {
        if (error.name === 'CastError') {
            return null; // Return null if the ID is invalid
        }
        throw new Error(error);
    }
    }

  async   findOne(condition: RootFilterQuery<T>, sort: Record<string, any> = {}): Promise<T | null> {
        try{
            (condition as any).deletedAt = null;
            return await this.Model.findOne(condition).sort(sort).exec();
        } catch (error: any) {
            if (error.name === 'CastError') {
                return null; // Return null if the ID is invalid
            }
            throw new Error(error);
        }

    }

    all(
        condition: RootFilterQuery<T>,
        sort: Record<string, any> = { _id: -1 },
        page?: number,
        limit: number = 10
    ) {
        (condition as any).deletedAt = null;

        if (page) {
            const Model = this.Model as PaginateModel<T>;
            const options: PaginateOptions = {
                sort,
                page,
                limit,
            };
            return  Model.paginate(condition, options);
        }
        
        return this.Model.find(condition).sort(sort).limit(limit);
    }

    find(
        condition: RootFilterQuery<T>,
        sort: Record<string, any> = { _id: -1 },
    ) { 
        (condition as any).deletedAt = null;

        return this.Model.find(condition).sort(sort);
    }

    distinct(field: string, condition: RootFilterQuery<T>,) {
        (condition as any).deletedAt = null;
        
        return this.Model.distinct(field, condition);
    }

    truncate(condition:  RootFilterQuery<T>): Promise<any> {
        if (process.env.NODE_ENV === "development") {
            return this.Model.deleteMany(condition).exec();
        }
        throw new Error("Truncate is only allowed in development mode");
    }

    aggregate(pipeline: PipelineStage[]) {
        return this.Model.aggregate(pipeline);
    };

    deleteMany(condition:  RootFilterQuery<T>): Promise<any> {
        return this.Model.deleteMany(condition).exec();
    }


    deleteOne(condition:  RootFilterQuery<T>): Promise<any> {
        return this.Model.findOneAndUpdate(
            condition,
            { deletedAt: new Date() },
            { new: true }
          );
    }

    count(condition:  RootFilterQuery<T> = {}): Promise<number> {
        return this.Model.countDocuments(condition).exec();
    }

    update(query: RootFilterQuery<T>, newData: Partial<T> | UpdateQuery<T>, session?: any): Promise<any> {
        (query as any).deletedAt = null;
        
        return this.Model.updateMany(query, newData).session(session).exec();
    }

    upsert(query: RootFilterQuery<T>, newData: Partial<T>): Promise<any> {
        (query as any).deletedAt = null;
        
        return this.Model.updateOne(query, newData, { upsert: true, setDefaultsOnInsert: true }).exec();
    }
}

export default MongoDBRepository;
