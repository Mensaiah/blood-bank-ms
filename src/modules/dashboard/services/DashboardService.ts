import { UserType } from "../../../enum/User";
import { BloodUnitStatus } from "../../blood-donation/enum/bloodUnit.enum";
import BloodUnitRepository from "../../blood-donation/repositories/BloodUnitRepository";
import DonorRepository from "../../blood-donation/repositories/DonorRepository";
import UserService from "../../users/services/UserService";

const ABOUT_TO_EXPIRE_IN_DAYS = 7;

type DashboardCard = {
  title: string;
  value: number;
};

export default class DashboardService {
  public static async getCards() {
    const now = new Date();
    const aboutToExpireDate = new Date(now);
    aboutToExpireDate.setDate(aboutToExpireDate.getDate() + ABOUT_TO_EXPIRE_IN_DAYS);

    const [totalAvailableUnits, donorsCount, aboutToExpire, registeredHospital] = await Promise.all([
      BloodUnitRepository.count({ status: BloodUnitStatus.AVAILABLE }),
      DonorRepository.count({}),
      BloodUnitRepository.count({
        status: BloodUnitStatus.AVAILABLE,
        expiryDate: {
          $gte: now,
          $lte: aboutToExpireDate,
        },
      } as any),
      UserService.getUserCounts({ type: UserType.HOSPITAL_REP }),
    ]);

    const cards: DashboardCard[] = [
      { title: "Total Available Units", value: totalAvailableUnits },
      { title: "Donors Count", value: donorsCount },
      { title: "About to Expire", value: aboutToExpire },
      { title: "Registered Hospital", value: registeredHospital },
    ];

    return cards;
  }
}
