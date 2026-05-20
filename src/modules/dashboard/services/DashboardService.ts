import { UserType } from "../../../enum/User";
import { BloodUnitStatus } from "../../blood-donation/enum/bloodUnit.enum";
import BloodUnitRepository from "../../blood-donation/repositories/BloodUnitRepository";
import DonationRepository from "../../blood-donation/repositories/DonationRepository";
import DonorRepository from "../../blood-donation/repositories/DonorRepository";
import UserService from "../../users/services/UserService";

const ABOUT_TO_EXPIRE_IN_DAYS = 7;

type DashboardCard = {
  title: string;
  value: number;
};

type MenuItem = {
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
};

type RecentDonationRow = {
  donationCode: string;
  donorName: string;
  bloodGroup: string;
  units: number;
  status: string;
  donationDate: Date;
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

  public static async getRecentDonations(limit = 8): Promise<RecentDonationRow[]> {
    const donations = await DonationRepository.getRecentDonations(limit, 0);

    return donations.map((item: any) => ({
      donationCode: item.donationCode,
      donorName: item?.donorId?.name || "Unknown Donor",
      bloodGroup: item?.donorId?.bloodGroup || "—",
      units: Array.isArray(item.bloodUnits) ? item.bloodUnits.length : 0,
      status: item.status,
      donationDate: item.donationDate,
    }));
  }

  public static getMenuItems(): MenuItem[] {
    const menuItems: MenuItem[] = [
      {
        name: "Dashboard",
        path: "/",
        icon: "ri-dashboard-line",
        },
            {
            name: "Donors",
            path: "/donors",
            icon: "ri-user-heart-line"
        },
        {
            name: "Donations",
            path: "/donations",
            icon: "ri-hand-heart-line"
        },
         {
            name: "Blood Units",
            path: "/blood-units",
            icon: "ri-droplet"
        },
    
        {
            name: "Requests",
            path: "/requests",
            icon: "ri-file-list-line"
        },
     
      {
        name: "Notifications",
        path: "/notifications",
        icon: "ri-notification-line",
      },
      // {
      //   name: "Users",
      //   path: "/users",
      //   icon: "ri-user-line",
      // },
    ];

    return menuItems;
  }
}
