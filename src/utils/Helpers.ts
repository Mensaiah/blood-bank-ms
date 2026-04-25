

import { endOfMonth, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays } from "date-fns";
import { DurationRangeType, PercentageChangeType } from "../enum";
import slugify from "slugify";
import { BigNumber } from "bignumber.js";

export default class GeneralHelpers {
  static formatSortFilter(sort?: string) {
    let sortQuery: Record<string, number> = { _id: -1 };

    if (!sort) {
      return sortQuery;
    }

    let [sortBy = "_id", orderBy = "desc"] = sort.split(":");

    if (sortBy === "id") {
      sortBy = "_id";
    }

    const order = orderBy === "asc" ? 1 : -1;

    sortQuery = { [sortBy]: order };

    return sortQuery;
  }
   
  static generateSlug(str: string): string {
    return slugify(`${str}-${this.generateRandomChar(4)}`, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true,
      locale: 'en',
      trim: true
    })
  }

    
  static capitalize(value: string): string {

    if (!value) {
      return ''
    }

    const result = value.split(/_|-/).map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join(' ')
            

    return result

    


  };

  static generateRandomChar(length: number = 6): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
      
    return result
    
  }

  static generateNumber(length: number = 6): string {
    const characters = '1234567890';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
      
    return result
    
  }

  static generatePaymentReference() {
    const uniqueCode = this.generateNumber(12);
    
    return `PLNXREF_${uniqueCode}`
  }

  static handleDuration(duration: DurationRangeType): { startDate: Date, endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    const previousMonth = subDays(now, 30);
    
    switch (duration) {
      case DurationRangeType.TODAY:
        startDate = startOfDay(now);
        break;
      case DurationRangeType.THIS_WEEK:
        startDate = startOfWeek(now, { weekStartsOn: 0 });
        break;
      case DurationRangeType.LAST_30_DAYS:
        startDate = subDays(now, 30);
        break;
      case DurationRangeType.THIS_MONTH:
        startDate = startOfMonth(now);
        break;
      case DurationRangeType.THIS_YEAR:
        startDate = startOfYear(now);
        break;
      case DurationRangeType.LAST_MONTH:
        startDate = startOfMonth(previousMonth);
        endDate = endOfMonth(previousMonth)
        break;
      case DurationRangeType.LAST_7_DAYS:
        startDate = subDays(now, 7);
        break;
      case DurationRangeType.LAST_90_DAYS:
        startDate = subDays(now, 90);
        break;
      case DurationRangeType.LAST_6_MONTHS:
        startDate = subDays(now, 180);
        break;
      case DurationRangeType.LAST_12_MONTHS:
        startDate = subDays(now, 365);
        break;
      case DurationRangeType.LAST_WEEK:
        endDate = subDays(startOfWeek(now, { weekStartsOn: 0 }), 1);
        startDate = startOfWeek(subDays(endDate, 6), { weekStartsOn: 0 });
        break;
      case DurationRangeType.LAST_YEAR:
        startDate = startOfYear(subDays(now, 365));
        endDate = endOfMonth(subDays(now, 365));
        break;
      case DurationRangeType.YESTERDAY:
        endDate = subDays(startOfDay(now), 1);
        startDate = startOfDay(endDate);
        break;
      
      default:
        throw new Error("Invalid duration");
    }
    
    return { startDate, endDate };
    
    
    
  }
  static durationTPreviousRange(duration: DurationRangeType): DurationRangeType {
            const durationToLast: Partial<Record<DurationRangeType, DurationRangeType>>= {
            
            [DurationRangeType.THIS_WEEK]: DurationRangeType.LAST_WEEK,
            [DurationRangeType.THIS_MONTH]: DurationRangeType.LAST_MONTH,
              [DurationRangeType.THIS_YEAR]: DurationRangeType.LAST_YEAR,
              [DurationRangeType.TODAY]: DurationRangeType.YESTERDAY,
              






            

            }
    
            return durationToLast[duration] || duration;

  }
  
  static calculatePercentChange(oldNumber: number, newNumber: number): { percentChangeType: PercentageChangeType, percentChange: number } {

    const change  = new BigNumber(newNumber).minus(oldNumber);
    const percentChange = change.dividedBy(oldNumber === 0 ? 1 : oldNumber).multipliedBy(100).decimalPlaces(2).abs().toNumber();
    



    return {
      percentChangeType: newNumber < oldNumber ? PercentageChangeType.DECREASE : PercentageChangeType.INCREASE,
      percentChange,
    }
  }

}