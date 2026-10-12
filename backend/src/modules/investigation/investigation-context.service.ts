import type {
  Request,
  Response,
} from "express";

import FraudCase
  from "../cases/fraud-case.model.js";

import Transaction
  from "../transactions/transaction.model.js";

import RiskAssessment
  from "../risk/risk.model.js";

import FraudEvidence
  from "../evidence/fraud-evidence.model.js";

import {
  checkOllamaHealth,
} from "./ai-investigator.service.js";


// =====================================================
// GET INVESTIGATION CONTEXT
// =====================================================

export const getInvestigationContext =
  async (
    caseId: string
  ) => {

    // =====================================================
    // GET FRAUD CASE
    // =====================================================

    const fraudCase =
      await FraudCase
        .findOne({
          caseId,
        })
        .lean();


    if (!fraudCase) {

      throw new Error(
        "Fraud case not found"
      );
    }


    // =====================================================
    // GET TRANSACTION
    // =====================================================

    const transaction =
      await Transaction
        .findById(
          fraudCase.transactionId
        )
        .lean();


    if (!transaction) {

      throw new Error(
        "Transaction not found"
      );
    }


    // =====================================================
    // GET RISK ASSESSMENT
    // =====================================================

    const riskAssessment =
      await RiskAssessment
        .findById(
          fraudCase.riskAssessmentId
        )
        .lean();


    if (!riskAssessment) {

      throw new Error(
        "Risk assessment not found"
      );
    }


    // =====================================================
    // GET FRAUD EVIDENCE
    // =====================================================

    const fraudEvidence =
      await FraudEvidence
        .findOne({
          transactionId:
            transaction._id,
        })
        .lean();


    // =====================================================
    // GET PREVIOUS TRANSACTIONS
    // =====================================================

    const previousTransactions =
      await Transaction
        .find({
          customerId:
            transaction.customerId,

          _id: {
            $ne:
              transaction._id,
          },
        })
        .sort({
          transactionTime: -1,
        })
        .limit(3)
        .select({
          transactionId: 1,
          amount: 1,
          currency: 1,
          merchant: 1,
          deviceId: 1,
          ipAddress: 1,
          location: 1,
          transactionType: 1,
          status: 1,
          transactionTime: 1,
        })
        .lean();


    // =====================================================
    // GET PREVIOUS FRAUD CASES
    // =====================================================

    const previousCases =
      await FraudCase
        .find({
          customerId:
            fraudCase.customerId,

          _id: {
            $ne:
              fraudCase._id,
          },
        })
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select({
          caseId: 1,
          riskScore: 1,
          severity: 1,
          status: 1,
          resolution: 1,
          createdAt: 1,
        })
        .lean();


    // =====================================================
    // RETURN COMPLETE CONTEXT
    // =====================================================

    return {

      fraudCase,

      transaction,

      riskAssessment,

      fraudEvidence,

      previousTransactions,

      previousCases,
    };
  };


// =====================================================
// CHECK LOCAL AI / OLLAMA STATUS
// =====================================================

export const getAIHealth =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const available =
        await checkOllamaHealth();


      return res
        .status(
          available
            ? 200
            : 503
        )
        .json({

          success:
            available,

          provider:
            "OLLAMA",

          model:
            process.env
              .OLLAMA_MODEL ??
            "qwen2.5:3b",

          status:
            available
              ? "healthy"
              : "offline",
        });


    } catch (error) {

      console.error(
        "Ollama health check error:",
        error
      );


      return res
        .status(503)
        .json({

          success: false,

          provider:
            "OLLAMA",

          model:
            process.env
              .OLLAMA_MODEL ??
            "qwen2.5:3b",

          status:
            "offline",

          message:
            "Ollama health check failed",
        });
    }
  };