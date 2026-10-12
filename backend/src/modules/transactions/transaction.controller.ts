import type { Request, Response } from "express";

import Transaction from "./transaction.model.js";
import RiskAssessment from "../risk/risk.model.js";

import {
  calculateRuleRisk,
} from "../risk/risk.service.js";

import {
  calculateBehaviorRisk,
} from "../risk/behavior-risk.service.js";

import {
  calculateFinalRisk,
} from "../risk/risk-fusion.service.js";

import {
  getMLPrediction,
  getMLExplanation,
} from "../../services/ml.service.js";

import {
  createFraudCase,
} from "../cases/fraud-case.service.js";

import {
  createFraudEvidence,
} from "../evidence/evidence.service.js";

import FraudCase
  from "../cases/fraud-case.model.js";


// =====================================================
// CREATE TRANSACTION
// =====================================================

export const createTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    // =====================================================
    // REQUEST BODY
    // =====================================================

    const {
      customerId,
      amount,
      currency,
      merchant,
      deviceId,
      ipAddress,
      location,
      transactionType,
      transactionTime,
    } = req.body;


    // =====================================================
    // 1. VALIDATION
    // =====================================================

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is required",
      });
    }


    if (
      amount === undefined ||
      amount === null ||
      Number.isNaN(Number(amount)) ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }


    if (!transactionType) {
      return res.status(400).json({
        success: false,
        message: "transactionType is required",
      });
    }


    const numericAmount = Number(amount);


    // =====================================================
    // 2. TRANSACTION TIME
    // =====================================================

    const currentTransactionTime =
      transactionTime
        ? new Date(transactionTime)
        : new Date();


    if (
      Number.isNaN(
        currentTransactionTime.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transactionTime",
      });
    }


    // =====================================================
    // 3. RULE-BASED RISK
    // =====================================================

    const ruleRisk =
      calculateRuleRisk({
        amount: numericAmount,

        transactionTime:
          currentTransactionTime,

        deviceId,

        ipAddress,
      });


    console.log(
      "Rule Risk:",
      ruleRisk
    );


    // =====================================================
    // 4. BEHAVIOR RISK
    // =====================================================

    const behaviorRisk =
      await calculateBehaviorRisk({
        customerId,

        amount:
          numericAmount,

        deviceId,

        location,

        transactionTime:
          currentTransactionTime,
      });


    console.log(
      "Behavior Risk:",
      behaviorRisk
    );


    // =====================================================
    // 5. ML PREDICTION
    // =====================================================

    const mlPrediction =
      await getMLPrediction({
        amount:
          numericAmount,

        transactionType,
      });


    console.log(
      "ML Prediction:",
      mlPrediction
    );


    // =====================================================
    // 6. FINAL RISK FUSION
    // =====================================================

    const finalRisk =
      calculateFinalRisk({
        ruleRisk:
          ruleRisk.score,

        behaviorRisk:
          behaviorRisk.score,

        mlRisk:
          mlPrediction.mlRisk,

        hasBehaviorHistory:
          behaviorRisk.hasSufficientHistory,

        mlAvailable:
          mlPrediction.available,
      });


    console.log(
      "Final Risk:",
      finalRisk
    );


    // =====================================================
    // 7. GENERATE TRANSACTION ID
    // =====================================================

    const transactionId =
      `TXN-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;


    // =====================================================
    // 8. TRANSACTION STATUS
    // =====================================================

    const transactionStatus =
      finalRisk.finalRisk >= 60
        ? "FLAGGED"
        : "APPROVED";


    // =====================================================
    // 9. SAVE TRANSACTION
    // =====================================================

    const transaction =
      await Transaction.create({
        transactionId,

        customerId,

        amount:
          numericAmount,

        currency:
          currency ?? "INR",

        merchant,

        deviceId,

        ipAddress,

        location,

        transactionType,

        transactionTime:
          currentTransactionTime,

        status:
          transactionStatus,
      });


    console.log(
      "Transaction saved:",
      transaction._id
    );


    // =====================================================
    // 10. COMBINE RISK REASONS
    // =====================================================

    const allReasons: string[] = [
      ...(ruleRisk.reasons ?? []),
      ...(behaviorRisk.reasons ?? []),
    ];


    // =====================================================
    // ML REASON
    // =====================================================

    if (
      mlPrediction.available &&
      mlPrediction.prediction === "FRAUD"
    ) {
      allReasons.push(
        `ML model detected fraud probability of ${(
          mlPrediction.probability * 100
        ).toFixed(2)}%`
      );
    }


    // =====================================================
    // 11. SAVE RISK ASSESSMENT
    // =====================================================

    const assessment =
      await RiskAssessment.create({
        transactionId:
          transaction._id,

        ruleRisk:
          ruleRisk.score,

        behaviorRisk:
          behaviorRisk.score,

        mlRisk:
          mlPrediction.mlRisk,

        graphRisk: 0,

        finalRisk:
          finalRisk.finalRisk,

        riskLevel:
          finalRisk.riskLevel,

        reasons:
          allReasons,

        behaviorReasons:
          behaviorRisk.reasons ?? [],

        behaviorSignals: {
          historyCount:
            behaviorRisk.historyCount ?? 0,

          averageAmount:
            behaviorRisk.signals
              ?.averageAmount ?? 0,

          amountRatio:
            behaviorRisk.signals
              ?.amountRatio ?? 0,

          isNewDevice:
            behaviorRisk.signals
              ?.isNewDevice ?? false,

          isNewLocation:
            behaviorRisk.signals
              ?.isNewLocation ?? false,

          unusualHour:
            behaviorRisk.signals
              ?.unusualHour ?? false,

          recent10MinCount:
            behaviorRisk.signals
              ?.recent10MinCount ?? 0,
        },

        modelVersion:
          mlPrediction.available
            ? mlPrediction.modelVersion
            : "behavior-engine-v1",
      });


    console.log(
      "Risk Assessment saved:",
      assessment._id
    );


    // =====================================================
    // 12. ML EXPLANATION / SHAP
    // =====================================================

    const mlExplanation =
      await getMLExplanation({
        amount:
          numericAmount,

        transactionType,
      });


    console.log(
      "ML Explanation:",
      mlExplanation
    );


    // =====================================================
    // 13. CREATE FRAUD CASE
    // =====================================================

    // any is intentionally used here because
    // createFraudCase may return a mongoose document
    // with a project-specific type.

    let fraudCase: any = null;


    if (
      finalRisk.riskLevel === "HIGH" ||
      finalRisk.riskLevel === "CRITICAL"
    ) {
      fraudCase =
        await createFraudCase({
          transactionId:
            transaction._id.toString(),

          customerId,

          riskAssessmentId:
            assessment._id.toString(),

          riskScore:
            finalRisk.finalRisk,

          riskLevel:
            finalRisk.riskLevel,

          reasons:
            allReasons,
        });


      console.log(
        "Fraud Case:",
        fraudCase
      );
    }


    // =====================================================
    // 14. CREATE FRAUD EVIDENCE
    // =====================================================

    const fraudEvidence =
      await createFraudEvidence({
        transactionId:
          transaction._id.toString(),

        riskAssessmentId:
          assessment._id.toString(),

        fraudCaseId:
          fraudCase && fraudCase._id
            ? fraudCase._id.toString()
            : null,

        customerId,

        ruleReasons:
          ruleRisk.reasons ?? [],

        behaviorReasons:
          behaviorRisk.reasons ?? [],

        mlExplanation:
          mlExplanation.explanation ?? [],

        mlPrediction:
          mlPrediction.prediction,

        mlProbability:
          mlPrediction.probability,

        ruleRisk:
          ruleRisk.score,

        behaviorRisk:
          behaviorRisk.score,

        mlRisk:
          mlPrediction.mlRisk,

        finalRisk:
          finalRisk.finalRisk,

        riskLevel:
          finalRisk.riskLevel,
      });


    console.log(
      "Fraud Evidence:",
      fraudEvidence
    );


    // =====================================================
    // 15. SUCCESS RESPONSE
    // =====================================================

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Transaction analyzed successfully",

        data: {
          
 ml: {

  available:
    mlPrediction.available,

  prediction:
    mlPrediction.prediction,

  fraudProbability:
    mlPrediction.probability,

  mlRisk:
    mlPrediction.mlRisk,

  modelVersion:
    mlPrediction.modelVersion,

  modelName:
    mlPrediction.modelName,

  explanation:
    mlExplanation.explanation,

  },

          risk: {
            // =============================================
            // FINAL RISK
            // =============================================

            finalRisk:
              assessment.finalRisk,

            level:
              assessment.riskLevel,


            // =============================================
            // COMPONENTS
            // =============================================

            components: {
              ruleRisk:
                assessment.ruleRisk,

              behaviorRisk:
                assessment.behaviorRisk,

              mlRisk:
                assessment.mlRisk,

              graphRisk:
                assessment.graphRisk,
            },


            // =============================================
            // ML
            // =============================================

            ml: {
              available:
                mlPrediction.available,

              prediction:
                mlPrediction.prediction,

              fraudProbability:
                mlPrediction.probability,

              mlRisk:
                mlPrediction.mlRisk,

              modelVersion:
                mlPrediction.modelVersion,

              modelName:
                mlPrediction.modelName,

              explanationAvailable:
                mlExplanation.available,

              explanation:
                mlExplanation.explanation ?? [],
            },


            // =============================================
            // BEHAVIOR
            // =============================================

            behavior: {
              historyCount:
                behaviorRisk.historyCount,

              sufficientHistory:
                behaviorRisk.hasSufficientHistory,

              signals:
                behaviorRisk.signals,

              reasons:
                behaviorRisk.reasons ?? [],
            },


            // =============================================
            // RULE
            // =============================================

            rule: {
              score:
                ruleRisk.score,

              reasons:
                ruleRisk.reasons ?? [],
            },


            // =============================================
            // ALL REASONS
            // =============================================

            reasons:
              assessment.reasons,
          },
        },
      });

  } catch (error) {
    // =====================================================
    // ERROR
    // =====================================================

    console.error(
      "Create transaction error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to process transaction",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
  }
};
;

// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

export const getAllTransactions =
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
          Number(
            req.query.page
          ) || 1,
          1
        );


      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 10,
            1
          ),
          100
        );


      const skip =
        (
          page - 1
        ) * limit;


      // =====================================================
      // FILTER
      // =====================================================

      const filter: Record<
        string,
        unknown
      > = {};


      // -----------------------------------------------------
      // STATUS
      // -----------------------------------------------------

      if (
        typeof req.query.status ===
          "string" &&
        req.query.status.trim()
      ) {

        filter.status =
          req.query.status
            .trim()
            .toUpperCase();
      }


      // -----------------------------------------------------
      // TRANSACTION TYPE
      // -----------------------------------------------------

      if (
        typeof req.query
          .transactionType ===
          "string" &&
        req.query
          .transactionType
          .trim()
      ) {

        filter.transactionType =
          req.query
            .transactionType
            .trim()
            .toUpperCase();
      }


      // -----------------------------------------------------
      // CUSTOMER
      // -----------------------------------------------------

      if (
        typeof req.query
          .customerId ===
          "string" &&
        req.query
          .customerId
          .trim()
      ) {

        filter.customerId =
          req.query
            .customerId
            .trim();
      }


      // -----------------------------------------------------
      // GLOBAL SEARCH
      // -----------------------------------------------------

      if (
        typeof req.query.search ===
          "string" &&
        req.query.search.trim()
      ) {

        const search =
          req.query.search
            .trim();


        filter.$or = [

          {
            transactionId: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            customerId: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            merchant: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            deviceId: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            ipAddress: {
              $regex:
                search,

              $options:
                "i",
            },
          },
        ];
      }


      // =====================================================
      // DATABASE QUERY
      // =====================================================

      const [
        transactions,
        total,
      ] =
        await Promise.all([

          Transaction
            .find(
              filter
            )
            .sort({
              transactionTime:
                -1,
            })
            .skip(
              skip
            )
            .limit(
              limit
            )
            .lean(),

          Transaction
            .countDocuments(
              filter
            ),
        ]);


      const totalPages =
        Math.max(
          Math.ceil(
            total /
            limit
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
            "Transactions fetched successfully",

          data: {

            transactions,

            pagination: {

              page,

              limit,

              total,

              totalPages,

              hasNextPage:
                page <
                totalPages,

              hasPreviousPage:
                page >
                1,
            },
          },
        });


    } catch (error) {

      console.error(
        "Get transactions error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to get transactions",

          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
    }
  };
// =====================================================
// GET SINGLE TRANSACTION
// =====================================================

export const getTransactionById =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const transactionId =
        req.params.transactionId;


      if (
        typeof transactionId !== "string" ||
        !transactionId.trim()
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "transactionId is required",
          });
      }


      // =====================================================
      // TRANSACTION
      // =====================================================

      const transaction =
        await Transaction
          .findOne({
            transactionId:
              transactionId.trim(),
          })
          .lean();


      if (!transaction) {

        return res
          .status(404)
          .json({

            success: false,

            message:
              "Transaction not found",
          });
      }


      // =====================================================
      // RISK ASSESSMENT
      // =====================================================

      const riskAssessment =
        await RiskAssessment
          .findOne({
            transactionId:
              transaction._id,
          })
          .lean();


      // =====================================================
      // FRAUD CASE
      // =====================================================

      const fraudCase =
        await FraudCase
          .findOne({
            transactionId:
              transaction._id,
          })
          .select({
            _id: 1,
            caseId: 1,
            riskScore: 1,
            severity: 1,
            status: 1,
            title: 1,
            createdAt: 1,
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
            "Transaction fetched successfully",

          data: {

            transaction,

            riskAssessment:
              riskAssessment ??
              null,

            fraudCase:
              fraudCase ??
              null,
          },
        });


    } catch (error) {

      console.error(
        "Get transaction error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to get transaction",

          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
    }
  };