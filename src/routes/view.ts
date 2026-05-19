import { Router, Request, Response } from "express";
import "express-async-errors";

import UserMiddleware from "../middlewares/user";
import DonorService from "../modules/blood-donation/services/DonorService";
import DonationRepository from "../modules/blood-donation/repositories/DonationRepository";
import DonationService from "../modules/blood-donation/services/DonationService";
import { IGetDonationsFilter } from "../modules/blood-donation/interfaces/IDonation";

const router = Router();

const basePageData = {
  title: "Blood Bank Management System",
  author: "Blood Bank Management System",
  image: "/img/logo.png",
  keywords: "blood donation, blood bank, donate blood, find blood donors, blood donation centers",
};

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


router.get("/donations/create", async (req: Request, res: Response) => {
  const donors = await DonorService.getDonors({ page: 1, limit: 100 } as any);

  res.render("pages/create-donation", {
    page: {
      ...basePageData,
      title: "Create Donation | Blood Bank Management System",
    },
    donors,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Donations", href: "/donations" },
      { label: "Create Donation" },
    ],
  });

})


router.get("/login", (req: Request, res: Response) => {
  res.render("pages/login", {
    page: {
      ...basePageData,
      title: "Login | Blood Bank Management System",
    },
  });
});

router.get("/", UserMiddleware.authenticate, (req: Request, res: Response) => {
  res.render("pages/index", {
    page: {
      ...basePageData,
      title: "Blood Bank Management System",
    },
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