// import { DurationRangeType } from "../enum";


export interface IQuery {
    page: number;
    limit: number;
    searchText?: string;
    status?: string;
    sort?: string;
    startDate?: Date;
    endDate?: Date;
    // duration?: DurationRangeType;
}