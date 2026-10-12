import type {
  Request,
  Response,
} from "express";

import {
  investigateFraudCase,
} from "./ai-investigator.service.js";

import AIInvestigation
  from "./ai-investigation.model.js";


// =====================================================
// RUN AI INVESTIGATION
// =====================================================

export const runAIInvestigation =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        caseId,
      } = req.params;


      if (
        !caseId ||
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


      const result =
        await investigateFraudCase(
          caseId.trim()
        );


      return res
        .status(201)
        .json({

          success: true,

          message:
            "AI investigation completed",

          data: {

            investigationId:
              result
                .investigation
                ._id,

            caseId,

            model:
              result
                .investigation
                .modelName,

            report:
              result
                .investigation
                .report,
          },
        });


    } catch (error) {

      console.error(
        "AI investigation error:",
        error
      );


      const message =
        error instanceof Error
          ? error.message
          : "Unknown error";


      // ---------------------------------
      // Case not found
      // ---------------------------------

      if (
        message ===
        "Fraud case not found"
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message,
          });
      }


      // ---------------------------------
      // Related data missing
      // ---------------------------------

      if (
        message ===
          "Transaction not found" ||
        message ===
          "Risk assessment not found"
      ) {

        return res
          .status(404)
          .json({

            success: false,

            message,
          });
      }


      // ---------------------------------
      // Ollama unavailable
      // ---------------------------------

      if (
        message.includes(
          "Ollama is not running"
        )
      ) {

        return res
          .status(503)
          .json({

            success: false,

            message,
          });
      }


      // ---------------------------------
      // Timeout
      // ---------------------------------

      if (
        message.includes(
          "timed out"
        )
      ) {

        return res
          .status(504)
          .json({

            success: false,

            message,
          });
      }


      // ---------------------------------
      // Generic error
      // ---------------------------------

      return res
        .status(500)
        .json({

          success: false,

          message:
            "AI investigation failed",

          error:
            message,
        });
    }
  };


// =====================================================
// GET AI INVESTIGATIONS FOR CASE
// =====================================================

export const getCaseInvestigations =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        caseId,
      } = req.params;


      if (
        !caseId ||
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


      const investigations =
        await AIInvestigation
          .find()
          .populate({
            path:
              "caseId",

            match: {
              caseId:
                caseId.trim(),
            },
          })
          .sort({
            createdAt: -1,
          })
          .lean();


      const filtered =
        investigations.filter(
          (
            investigation: any
          ) =>
            investigation.caseId
        );


      return res
        .status(200)
        .json({

          success: true,

          data: {

            investigations:
              filtered,
          },
        });


    } catch (error) {

      console.error(
        "Get investigations error:",
        error
      );


      const message =
        error instanceof Error
          ? error.message
          : "Unknown error";


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to get AI investigations",

          error:
            message,
        });
    }
  };