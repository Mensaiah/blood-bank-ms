import { Router, Request, Response } from "express";
import "express-async-errors";

import UserMiddleware from "../middlewares/user";
import DonorService from "../modules/blood-donation/services/DonorService";
import DonationRepository from "../modules/blood-donation/repositories/DonationRepository";
import DonationService from "../modules/blood-donation/services/DonationService";
import BloodUnitService from "../modules/blood-donation/services/BloodUnitService";
import UserService from "../modules/users/services/UserService";
import NotificationService from "../modules/notifications/services/NotificationService";
import RequestService from "../modules/requests/services/RequestService";
import DashboardService from "../modules/dashboard/services/DashboardService";
import { IGetDonationsFilter } from "../modules/blood-donation/interfaces/IDonation";
import { IGetBloodUnitsFilter } from "../modules/blood-donation/interfaces/IBloodUnit";
import { BloodGroup } from "../modules/blood-donation/enum/donor.enum";

const router = Router();

const basePageData = {
  title: "Blood Bank Management System",
  author: "Blood Bank Management System",
  image: "/img/logo.png",
  keywords: "blood donation, blood bank, donate blood, find blood donors, blood donation centers",
};

// Helper function to get current user
const getCurrentUser = async (userId: string) => {
  try {
    if (userId) {
      return await UserService.getUserById(userId);
    }
  } catch (_error) {
    console.error("Failed to fetch current user", _error);
  }
  return null;
};

// Middleware to populate user data for authenticated routes
// router.use(UserMiddleware.authenticate);

router.get("/profile-information", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const userId = res.locals.user?.id; // Get user ID from res.locals set by authentication middleware
  console.log('userId:', userId)
  const currentUser = await getCurrentUser(userId);
  console.log('currentUser:', currentUser)

  if (!currentUser) {
    return res.status(404).render("pages/404", {
      page: {
        ...basePageData,
        title: "Page Not Found | Blood Bank Management System",
      },
    });
  }

  return res.render("pages/profile-information", {
    page: {
      ...basePageData,
      title: "Profile Information | Blood Bank Management System",
    },
    currentUser,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Profile Information" },
    ],
  });
});

router.get("/donors", (req: Request, res: Response) => {
  res.render("pages/donors", {
    page: {
      ...basePageData,
      title: "Donors | Blood Bank Management System",
    },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donors" },
    ],
  });
});

router.get("/donors/add", (req: Request, res: Response) => {
  res.render("pages/add-donors", {
    page: {
      ...basePageData,
      title: "Add Donors | Blood Bank Management System",
    },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donors", href: "/donors" },
      { label: "Add Donor" },
    ],
  });
});

router.get("/donors/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const donor = await DonorService.getDonorById(id as unknown as string);

  if (!donor) {
    return res.status(404).render("pages/404", {
      page: {
        ...basePageData,
        title: "Page Not Found | Blood Bank Management System",
      },
    });
  }

  res.render("pages/donor-details", {
    page: {
      ...basePageData,
      title: `${donor.name} | Donor Profile`,
    },
    donor,
    donations: await DonationRepository.getDonationsByDonor(donor._id.toString(), 10, 0),
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donors", href: "/donors" },
      { label: donor.name },
    ],
  });
});

router.get("/donors/:id/edit", async (req: Request, res: Response) => {
  const id = req.params.id;
  const donor = await DonorService.getDonorById(id as unknown as string);

  if (!donor) {
    return res.status(404).render("pages/404", {
      page: {
        ...basePageData,
        title: "Page Not Found | Blood Bank Management System",
      },
    });
  }

  res.render("pages/edit-donors", {
    page: {
      ...basePageData,
      title: "Edit Donor | Blood Bank Management System",
    },
    donor,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donors", href: "/donors" },
      { label: "Edit Donor" },
    ],
  });
});

router.get("/donations", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const filter: IGetDonationsFilter = {
    limit: 10,
    page: 1,
    ...req.query as any,
  };

  const { data: donations } = await DonationService.getDonations(filter);
  const stats = await DonationService.getSummaryCounts();
  const donationsList = Array.isArray(donations) ? donations : donations.docs;
  const pagination = Array.isArray(donations)
    ? { page: 1, totalPages: 1, totalDocs: donations.length, limit: donations.length }
    : {
        page: donations.page,
        totalPages: donations.totalPages,
        totalDocs: donations.totalDocs,
        limit: donations.limit,
      };

  res.render("pages/donations", {
    page: {
      ...basePageData,
      title: "Donations | Blood Bank Management System",
    },
    stats,
    donations: donationsList,
    pagination,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donations" },
    ],
  });
});

router.get("/donations/stats", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const stats = await DonationService.getSummaryCounts();

  return res.render("partials/donation-stats", { stats });
});

router.get("/donations/create", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  res.render("pages/create-donation", {
    page: {
      ...basePageData,
      title: "Create Donation | Blood Bank Management System",
    },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donations", href: "/donations" },
      { label: "Create Donation" },
    ],
  });
});

router.get("/donations/:id", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const donation = await DonationService.getDonationById(String(req.params.id));

  if (!donation) {
    return res.status(404).render("pages/404", {
      page: {
        ...basePageData,
        title: "Page Not Found | Blood Bank Management System",
      },
    });
  }

  return res.render("pages/donation-details", {
    page: {
      ...basePageData,
      title: `Donation ${donation.donationCode} | Blood Bank Management System`,
    },
    donation,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donations", href: "/donations" },
      { label: donation.donationCode },
    ],
  });
})


router.get("/blood-units", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const filter: IGetBloodUnitsFilter = {
    limit: 10,
    page: 1,
    ...req.query as any,
  };

  const unitsData = await BloodUnitService.getBloodUnits(filter);
  const bloodGroupPercentages = await BloodUnitService.getBloodGroupPercentages();
  const unitsList = Array.isArray(unitsData) ? unitsData : unitsData.docs;
  const pagination = Array.isArray(unitsData)
    ? { page: 1, totalPages: 1, totalDocs: unitsData.length, limit: unitsData.length }
    : {
        page: unitsData.page,
        totalPages: unitsData.totalPages,
        totalDocs: unitsData.totalDocs,
        limit: unitsData.limit,
      };
  const bloodGroups = Object.values(BloodGroup);
  const selectedBloodGroup = typeof req.query.bloodGroup === "string" && req.query.bloodGroup
    ? req.query.bloodGroup
    : bloodGroups[0];
  const selectedBloodGroupData = bloodGroupPercentages.find((item) => item.bloodGroup === selectedBloodGroup)
    || bloodGroupPercentages[0]
    || { bloodGroup: selectedBloodGroup, percentage: 0 };

  res.render("pages/blood-units", {
    page: {
      ...basePageData,
      title: "Blood Units | Blood Bank Management System",
    },
    units: unitsList,
    query: req.query,
    pagination,
    bloodGroups,
    selectedBloodGroup,
    bloodGroupTank: {
      ...selectedBloodGroupData,
      availableUnits: Math.min(200, Math.round((Number(selectedBloodGroupData.percentage || 0) / 100) * 200)),
    },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Blood Units" },
    ],
  });
});

router.get("/blood-units/blood-group-tank", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const bloodGroupPercentages = await BloodUnitService.getBloodGroupPercentages();
  const bloodGroups = Object.values(BloodGroup);
  const selectedBloodGroup = typeof req.query.bloodGroup === "string" && req.query.bloodGroup
    ? req.query.bloodGroup
    : bloodGroups[0];
  const selectedBloodGroupData = bloodGroupPercentages.find((item) => item.bloodGroup === selectedBloodGroup)
    || bloodGroupPercentages[0]
    || { bloodGroup: selectedBloodGroup, percentage: 0 };

  return res.render("partials/blood-group-tank-card", {
    bloodGroup: selectedBloodGroupData.bloodGroup,
    percentage: selectedBloodGroupData.percentage,
    availableUnits: Math.min(200, Math.round((Number(selectedBloodGroupData.percentage || 0) / 100) * 200)),
    goal: 200,
  });
});

router.get("/blood-units/:id", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const userType = res.locals.user.type;
  const unit = await BloodUnitService.getBloodUnitById(String(req.params.id));

  if (!unit) {
    return res.status(404).render("pages/404", {
      page: {
        ...basePageData,
        title: "Page Not Found | Blood Bank Management System",
      },
    });
  }

  const transitions = BloodUnitService.getNextAllowedTransitions(unit.status, userType);

  return res.render("pages/blood-unit-details", {
    page: {
      ...basePageData,
      title: `Blood Unit ${unit.unitId} | Blood Bank Management System`,
    },
    unit,
    allowedTransitions: transitions.allowedTransitions,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Blood Units", href: "/blood-units" },
      { label: unit.unitId },
    ],
  });
});

router.get("/blood-units/:id/transition-form", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const userType = res.locals.user.type;
  const unit = await BloodUnitService.getBloodUnitById(String(req.params.id));

  if (!unit) {
    return res.status(404).send("Blood unit not found");
  }

  const transitions = BloodUnitService.getNextAllowedTransitions(unit.status, userType);

  return res.render("partials/transition-form", {
    unitId: unit._id,
    currentStatus: unit.status,
    allowedTransitions: transitions.allowedTransitions,
  });
});

router.get("/notifications", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const donorsData: any = await DonorService.getDonors({ page: 1, limit: 300 } as any);
  const donors = Array.isArray(donorsData) ? donorsData : (donorsData?.docs || []);

  const notificationService = new NotificationService();
  const { data: history } = await notificationService.getHistory({ page: 1, limit: 20 });
  const historyDocs = history?.docs || [];

  return res.render("pages/notifications", {
    page: {
      ...basePageData,
      title: "Notifications | Blood Bank Management System",
    },
    donors,
    bloodGroups: Object.values(BloodGroup),
    history: historyDocs,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Notifications" },
    ],
  });
});

router.get("/requests", UserMiddleware.authenticate, async (_req: Request, res: Response) => {
  const recentRequests = await RequestService.getRecentRequests(15);

  return res.render("pages/requests", {
    page: {
      ...basePageData,
      title: "Blood Requests | Blood Bank Management System",
    },
    bloodGroups: Object.values(BloodGroup),
    recentRequests,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Requests" },
    ],
  });
});


router.get("/login", (req: Request, res: Response) => {
  res.render("pages/login", {
    page: {
      ...basePageData,
      title: "Login | Blood Bank Management System",
    },
  });
});

router.get("/", UserMiddleware.authenticate, async (req: Request, res: Response) => {
  const [cards, recentDonations] = await Promise.all([
    DashboardService.getCards(),
    DashboardService.getRecentDonations(8),
  ]);

  res.render("pages/index", {
    page: {
      ...basePageData,
      title: "Blood Bank Management System",
    },
    cards,
    recentDonations,
  });
});

router.get("*", (req: Request, res: Response) => {
  res.render("pages/404", {
    breadcrumb: {
      title: "Page Not Found",
    },
    page: {
      ...basePageData,
      title: "Page Not Found | Blood Bank Management System",
    },
  });
});

export default router;