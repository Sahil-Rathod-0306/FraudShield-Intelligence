import {
  Router,
} from "express";

import {
  runAIInvestigation,
  getCaseInvestigations,
} from "./ai-investigator.controller.js";
import { getAIHealth } from "./investigation-context.service.js";


const router =
  Router();


// =====================================================
// AI HEALTH
// =====================================================

router.get(
  "/health",
  getAIHealth
);


// =====================================================
// RUN INVESTIGATION
// =====================================================

router.post(
  "/cases/:caseId/investigate",
  runAIInvestigation
);


// =====================================================
// GET SAVED INVESTIGATIONS
// =====================================================

router.get(
  "/cases/:caseId/investigations",
  getCaseInvestigations
);


export default router;