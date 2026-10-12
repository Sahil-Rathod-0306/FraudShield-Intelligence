import {
  Router,
} from "express";

import {
  getAllFraudCases,
  getFraudCaseById,
  updateFraudCaseStatus,
  assignInvestigator,
  unassignInvestigator,
} from "./fraud-case.controller.js";


const router =
  Router();


// =====================================================
// GET ALL FRAUD CASES
// =====================================================

router.get(
  "/",
  getAllFraudCases
);


// =====================================================
// GET SINGLE FRAUD CASE
// =====================================================

router.get(
  "/:caseId",
  getFraudCaseById
);


// =====================================================
// UPDATE STATUS
// =====================================================

router.patch(
  "/:caseId/status",
  updateFraudCaseStatus
);


// =====================================================
// ASSIGN INVESTIGATOR
// =====================================================

router.patch(
  "/:caseId/assign",
  assignInvestigator
);


// =====================================================
// UNASSIGN INVESTIGATOR
// =====================================================

router.patch(
  "/:caseId/unassign",
  unassignInvestigator
);


export default router;