import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import FraudCase from "./fraud-case.model.js";
import Transaction from "../transactions/transaction.model.js";
import RiskAssessment from "../risk/risk.model.js";
import User from "../users/user.model.js";

import FraudEvidence
  from "../evidence/fraud-evidence.model.js";


// =====================================================
// CONSTANTS
// =====================================================

const VALID_STATUSES = [
  "OPEN",
  "INVESTIGATING",
  "ESCALATED",
  "CONFIRMED_FRAUD",
  "FALSE_POSITIVE",
  "CLOSED",
] as const;


const VALID_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;


type FraudCaseStatus =
  (typeof VALID_STATUSES)[number];

type FraudCaseSeverity =
  (typeof VALID_SEVERITIES)[number];


// =====================================================
// HELPERS
// =====================================================

const isValidStatus = (
  value: unknown
): value is FraudCaseStatus => {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(
      value as FraudCaseStatus
    )
  );
};


const isValidSeverity = (
  value: unknown
): value is FraudCaseSeverity => {
  return (
    typeof value === "string" &&
    VALID_SEVERITIES.includes(
      value as FraudCaseSeverity
    )
  );
};


const parsePositiveInteger = (
  value: unknown,
  fallback: number,
  max?: number
): number => {

  const parsed =
    Number(value);

  const safeValue =
    Number.isFinite(parsed) &&
    parsed > 0
      ? Math.floor(parsed)
      : fallback;

  if (
    typeof max === "number"
  ) {
    return Math.min(
      safeValue,
      max
    );
  }

  return safeValue;
};


const getErrorMessage = (
  error: unknown
): string => {

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Unknown error";
};


// =====================================================
// GET ALL FRAUD CASES
// =====================================================

export const getAllFraudCases =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      // =====================================================
      // PAGINATION
      // =====================================================

      const page =
        Math.max(
          Number(req.query.page) || 1,
          1
        );


      const limit =
        Math.min(
          Math.max(
            Number(req.query.limit) || 10,
            1
          ),
          100
        );


      const skip =
        (page - 1) * limit;


      // =====================================================
      // FILTER
      // =====================================================

      const filter: Record<
        string,
        unknown
      > = {};


      // =====================================================
      // STATUS FILTER
      // =====================================================

      if (
        typeof req.query.status === "string" &&
        req.query.status.trim()
      ) {

        filter.status =
          req.query.status
            .trim()
            .toUpperCase();
      }


      // =====================================================
      // SEVERITY FILTER
      // =====================================================

      if (
        typeof req.query.severity === "string" &&
        req.query.severity.trim()
      ) {

        filter.severity =
          req.query.severity
            .trim()
            .toUpperCase();
      }


      // =====================================================
      // CUSTOMER FILTER
      // =====================================================

      if (
        typeof req.query.customerId === "string" &&
        req.query.customerId.trim()
      ) {

        filter.customerId =
          req.query.customerId.trim();
      }


      // =====================================================
      // GLOBAL SEARCH
      // =====================================================

      if (
        typeof req.query.search === "string" &&
        req.query.search.trim()
      ) {

        const search =
          req.query.search.trim();


        filter.$or = [

          {
            caseId: {
              $regex: search,
              $options: "i",
            },
          },

          {
            customerId: {
              $regex: search,
              $options: "i",
            },
          },

          {
            title: {
              $regex: search,
              $options: "i",
            },
          },

          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }


      // =====================================================
      // DATABASE QUERY
      // =====================================================

      const [
        fraudCases,
        total,
      ] =
        await Promise.all([

          FraudCase
            .find(filter)

            .populate({
              path: "transactionId",

              select:
                "transactionId amount currency transactionType status merchant transactionTime",
            })

            .populate({
              path: "assignedTo",

              select:
                "name email role",
            })

            .sort({
              createdAt: -1,
            })

            .skip(skip)

            .limit(limit)

            .lean(),


          FraudCase
            .countDocuments(filter),
        ]);


      // =====================================================
      // TOTAL PAGES
      // =====================================================

      const totalPages =
        Math.max(
          Math.ceil(
            total / limit
          ),
          1
        );


      // =====================================================
      // RESPONSE
      // =====================================================

      return res
        .status(200)
        .json({

          success: true,

          message:
            "Fraud cases fetched successfully",

          data: {

            fraudCases,

            pagination: {

              page,

              limit,

              total,

              totalPages,

              hasNextPage:
                page < totalPages,

              hasPreviousPage:
                page > 1,
            },
          },
        });


    } catch (error) {

      console.error(
        "Get fraud cases error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to get fraud cases",

          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
    }
  };


// =====================================================
// GET SINGLE FRAUD CASE
// =====================================================

export const getFraudCaseById =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const caseId =
        req.params.caseId;


      // =====================================================
      // VALIDATION
      // =====================================================

      if (
        typeof caseId !== "string" ||
        !caseId.trim()
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "caseId is required",
          });
      }


      // =====================================================
      // GET FRAUD CASE
      // =====================================================

      const fraudCase =
        await FraudCase
          .findOne({
            caseId:
              caseId.trim(),
          })

          .populate({
            path:
              "transactionId",

            model:
              Transaction,
          })

          .populate({
            path:
              "riskAssessmentId",

            model:
              RiskAssessment,
          })

          .populate({
            path:
              "assignedTo",

            model:
              User,

            select:
              "name email role status",
          });


      if (!fraudCase) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Fraud case not found",
          });
      }


      // =====================================================
      // GET UNIFIED FRAUD EVIDENCE
      // =====================================================

      const fraudEvidence =
        await FraudEvidence
          .findOne({
            fraudCaseId:
              fraudCase._id,
          })
          .lean();


      // =====================================================
      // RESPONSE
      // =====================================================

      return res
        .status(200)
        .json({

          success: true,

          message:
            "Fraud case fetched successfully",

          data: {

            fraudCase,

            fraudEvidence:
              fraudEvidence ?? null,
          },
        });


    } catch (error) {

      console.error(
        "Get fraud case error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to get fraud case",

          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
    }
  };
// =====================================================
// UPDATE FRAUD CASE STATUS
// =====================================================

export const updateFraudCaseStatus =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const caseId =
        req.params.caseId;


      const {
        status,
        resolution,
      } =
        req.body as {
          status?: unknown;
          resolution?: unknown;
        };


      // =====================================================
      // CASE ID VALIDATION
      // =====================================================

      if (
        typeof caseId !==
          "string" ||
        !caseId.trim()
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "caseId is required",
          });
      }


      // =====================================================
      // STATUS VALIDATION
      // =====================================================

      if (
        !isValidStatus(
          status
        )
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Invalid case status",

            validStatuses:
              VALID_STATUSES,
          });
      }


      // =====================================================
      // RESOLUTION VALIDATION
      // =====================================================

      if (
        resolution !==
          undefined &&
        typeof resolution !==
          "string"
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "resolution must be a string",
          });
      }


      // =====================================================
      // UPDATE OBJECT
      // =====================================================

      const update:
        Record<
          string,
          unknown
        > = {

          status,
        };


      if (
        typeof resolution ===
          "string"
      ) {

        update.resolution =
          resolution.trim();
      }


      // =====================================================
      // UPDATE CASE
      // =====================================================

      const updatedCase =
        await FraudCase

          .findOneAndUpdate(

            {
              caseId:
                caseId.trim(),
            },

            {
              $set:
                update,
            },

            {
              new: true,

              runValidators:
                true,
            }
          )

          .populate({
            path:
              "transactionId",

            model:
              Transaction,
          })

          .populate({
            path:
              "riskAssessmentId",

            model:
              RiskAssessment,
          })

          .populate({
            path:
              "assignedTo",

            model:
              User,

            select:
              "name email role status",
          });


      // =====================================================
      // NOT FOUND
      // =====================================================

      if (
        !updatedCase
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Fraud case not found",
          });
      }


      // =====================================================
      // RESPONSE
      // =====================================================

      return res
        .status(200)
        .json({

          success: true,

          message:
            "Fraud case status updated successfully",

          data: {

            fraudCase:
              updatedCase,
          },
        });

    } catch (error) {

      console.error(
        "Update fraud case error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to update fraud case",

          error:
            getErrorMessage(
              error
            ),
        });
    }
  };


// =====================================================
// ASSIGN INVESTIGATOR
// =====================================================

export const assignInvestigator =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const caseId =
        req.params.caseId;


      const {
        investigatorId,
      } =
        req.body as {
          investigatorId?: unknown;
        };


      // =====================================================
      // CASE ID VALIDATION
      // =====================================================

      if (
        typeof caseId !==
          "string" ||
        !caseId.trim()
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "caseId is required",
          });
      }


      // =====================================================
      // INVESTIGATOR ID VALIDATION
      // =====================================================

      if (
        typeof investigatorId !==
          "string" ||
        !investigatorId.trim()
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "investigatorId is required and must be a string",
          });
      }


      const cleanInvestigatorId =
        investigatorId.trim();


      if (
        !mongoose.Types.ObjectId
          .isValid(
            cleanInvestigatorId
          )
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Invalid investigatorId",
          });
      }


      // =====================================================
      // VERIFY INVESTIGATOR
      // =====================================================

      const investigator =
        await User

          .findById(
            cleanInvestigatorId
          )

          .select(
            "name email role status"
          )

          .lean();


      if (
        !investigator
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Investigator user not found",
          });
      }


      // =====================================================
      // ROLE VALIDATION
      // =====================================================

      const investigatorRole =
        String(
          investigator.role
        ).toUpperCase();


      if (
        investigatorRole !==
        "INVESTIGATOR"
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Selected user is not an INVESTIGATOR",

            currentRole:
              investigator.role,
          });
      }


      // =====================================================
      // FIND FRAUD CASE
      // =====================================================

      const existingCase =
        await FraudCase

          .findOne({
            caseId:
              caseId.trim(),
          })

          .select(
            "status assignedTo"
          )

          .lean();


      if (
        !existingCase
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Fraud case not found",
          });
      }


      // =====================================================
      // CREATE UPDATE
      // =====================================================

      const update:
        Record<
          string,
          unknown
        > = {

          assignedTo:
            new mongoose.Types.ObjectId(
              cleanInvestigatorId
            ),
        };


      // Automatically change:
      // OPEN -> INVESTIGATING

      if (
        existingCase.status ===
        "OPEN"
      ) {

        update.status =
          "INVESTIGATING";
      }


      // =====================================================
      // ASSIGN INVESTIGATOR
      // =====================================================

      const populatedCase =
        await FraudCase

          .findOneAndUpdate(

            {
              caseId:
                caseId.trim(),
            },

            {
              $set:
                update,
            },

            {
              new: true,

              runValidators:
                true,
            }
          )

          .populate({
            path:
              "transactionId",

            model:
              Transaction,
          })

          .populate({
            path:
              "riskAssessmentId",

            model:
              RiskAssessment,
          })

          .populate({
            path:
              "assignedTo",

            model:
              User,

            select:
              "name email role status",
          });


      if (
        !populatedCase
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Fraud case not found",
          });
      }


      // =====================================================
      // RESPONSE
      // =====================================================

      return res
        .status(200)
        .json({

          success: true,

          message:
            "Investigator assigned successfully",

          data: {

            fraudCase:
              populatedCase,
          },
        });

    } catch (error) {

      console.error(
        "Assign investigator error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to assign investigator",

          error:
            getErrorMessage(
              error
            ),
        });
    }
  };


// =====================================================
// UNASSIGN INVESTIGATOR
// =====================================================

export const unassignInvestigator =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const caseId =
        req.params.caseId;


      // =====================================================
      // CASE ID VALIDATION
      // =====================================================

      if (
        typeof caseId !==
          "string" ||
        !caseId.trim()
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "caseId is required",
          });
      }


      // =====================================================
      // FIND FRAUD CASE
      // =====================================================

      const existingCase =
        await FraudCase

          .findOne({
            caseId:
              caseId.trim(),
          })

          .select(
            "assignedTo status"
          )

          .lean();


      if (
        !existingCase
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Fraud case not found",
          });
      }


      // =====================================================
      // CHECK ASSIGNMENT
      // =====================================================

      if (
        !existingCase.assignedTo
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "No investigator is currently assigned to this case",
          });
      }


      // =====================================================
      // CREATE UPDATE
      // =====================================================

      const update:
        Record<
          string,
          unknown
        > = {

          assignedTo:
            null,
        };


      // Automatically change:
      // INVESTIGATING -> OPEN

      if (
        existingCase.status ===
        "INVESTIGATING"
      ) {

        update.status =
          "OPEN";
      }


      // =====================================================
      // UNASSIGN
      // =====================================================

      const updatedCase =
        await FraudCase

          .findOneAndUpdate(

            {
              caseId:
                caseId.trim(),
            },

            {
              $set:
                update,
            },

            {
              new: true,

              runValidators:
                true,
            }
          )

          .populate({
            path:
              "transactionId",

            model:
              Transaction,
          })

          .populate({
            path:
              "riskAssessmentId",

            model:
              RiskAssessment,
          })

          .populate({
            path:
              "assignedTo",

            model:
              User,

            select:
              "name email role status",
          });


      if (
        !updatedCase
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Fraud case not found",
          });
      }


      // =====================================================
      // RESPONSE
      // =====================================================

      return res
        .status(200)
        .json({

          success: true,

          message:
            "Investigator unassigned successfully",

          data: {

            fraudCase:
              updatedCase,
          },
        });

    } catch (error) {

      console.error(
        "Unassign investigator error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to unassign investigator",

          error:
            getErrorMessage(
              error
            ),
        });
    }
  };