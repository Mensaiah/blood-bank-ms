import cron, { ScheduledTask } from "node-cron";
import logger from "../../../libs/logger";

import config from "../../../config";
import UserService from "../../users/services/UserService";


const TAG = "cron-tab";

export default class CronService {
  public static scheduledJobs: Record<string, ScheduledTask>;

  private static registerCronJob(): Record<string, ScheduledTask> {
    

    // const testCron = cron.schedule('* * * * * *', () =>
    //   UserService.finalizePendingDeletions()
    // );
    return {
      // testCron
    };
  }

  public static cronStart = () => {
    try {
      logger.info(`${TAG} Cron Job Online 1233333....`);
      this.scheduledJobs = this.registerCronJob();
      const cronJs = Object.values(CronService.scheduledJobs);
      for (let i = 0; i < cronJs.length; i++) {
        cronJs[i].start();
      }
      logger.info(`${TAG} Cron Job Started....`);
      return cron;
    } catch (error) {
      logger.error(error);
    }
  };

  public static cronStop = () => {
    try {
      logger.info(`${TAG} Cron Job Stopping 11....`);
      const cronJs = Object.values(CronService.scheduledJobs);
      for (let i = 0; i < cronJs.length; i++) {
        cronJs[i].stop();
      }
      logger.info(`${TAG} Cron Job Stopped....`);
      return cron;
    } catch (error) {
      logger.error(error);
    }
  };
}
