import { Router, Request, Response } from "express";
import "express-async-errors";

import UserMiddleware from "../middlewares/user";
import DonorService from "../modules/blood-donation/services/DonorService";

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