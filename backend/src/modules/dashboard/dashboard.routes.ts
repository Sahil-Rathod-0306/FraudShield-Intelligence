import {
  Router,
} from "express";

import {
  getDashboardOverview,
} from "./dashboard.controller.js";


const router =
  Router();


// =====================================================
// DASHBOARD OVERVIEW
// =====================================================

router.get(
  "/overview",
  getDashboardOverview
);


export default router;