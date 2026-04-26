import { Router,Request, Response } from "express";
import "express-async-errors"

import authsRoutes from '../modules/auth/routes';

import UserMiddleware from "../middlewares/user";

const router = Router();

router.use("/", authsRoutes);
router.use("/login", (req: Request, res: Response) => {
  res.render("pages/login", {
    breadcrumb: {
      title: 'Page Not Found',

  },
    page: {
   
        title:  "Page Not Found | 9jaMovlePlus | Download latest nollywood movies for free",
        author: "9jaMovlePlus",
        image: "https://9jamovieplus-files.s3.us-east-1.amazonaws.com/9JA_MOVIE_PLUS_LOGO-removebg-preview.png",
        keywords: "nollywood movies,download lastest nollywood movies,nigeria movies, hd movies",
    },
  });
});


router.get("*",  (req: Request, res: Response) => {
  res.render("pages/404", {
    breadcrumb: {
      title: 'Page Not Found',

  },
    page: {
   
        title:  "Page Not Found | 9jaMovlePlus | Download latest nollywood movies for free",
        author: "9jaMovlePlus",
        image: "https://9jamovieplus-files.s3.us-east-1.amazonaws.com/9JA_MOVIE_PLUS_LOGO-removebg-preview.png",
        keywords: "nollywood movies,download lastest nollywood movies,nigeria movies, hd movies",
    },
  });
});
// router.use("/", homeRoutes)



export default router;
