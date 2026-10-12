import type { Request, Response } from "express";

import Transaction from "../transactions/transaction.model.js";
import FraudCase from "../cases/fraud-case.model.js";
import RiskAssessment from "../risk/risk.model.js";

// =====================================================
// TYPES
// =====================================================

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TransactionStatus = "PENDING" | "APPROVED" | "DECLINED" | "FLAGGED";

interface AverageRiskRow {
  _id: null;
  averageRisk: number | null;
}

interface CountRow {
  _id: string | null;
  count: number;
}

interface TransactionTrendRow {
  _id: string; // YYYY-MM-DD (UTC)
  total: number;
  flagged: number;
}

interface RiskTrendRow {
  _id: string; // YYYY-MM-DD (UTC)
  averageRisk: number | null;
}

const roundToTwo = (value: number | null | undefined): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(2));
};

// =====================================================
// GET DASHBOARD OVERVIEW
// =====================================================

export const getDashboardOverview = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Use the last seven UTC calendar days, including today.
    const last7DaysStart = new Date();
    last7DaysStart.setUTCHours(0, 0, 0, 0);
    last7DaysStart.setUTCDate(last7DaysStart.getUTCDate() - 6);

    // Run all independent MongoDB queries in parallel.
    const [
      totalTransactions,
      flaggedTransactions,
      totalCases,
      activeCases,
      criticalCases,
      confirmedFraudCases,
      averageRiskResult,
      riskDistributionResult,
      transactionStatusResult,
      recentCases,
      recentFlaggedTransactions,
      transactionTrendResult,
      riskTrendResult,
    ] = await Promise.all([
      // Total transactions
      Transaction.countDocuments().exec(),

      // Flagged transactions
      Transaction.countDocuments({ status: "FLAGGED" }).exec(),

      // Total fraud cases
      FraudCase.countDocuments().exec(),

      // Active fraud cases
      FraudCase.countDocuments({
        status: { $in: ["OPEN", "INVESTIGATING", "ESCALATED"] },
      }).exec(),

      // Critical fraud cases
      FraudCase.countDocuments({ severity: "CRITICAL" }).exec(),

      // Confirmed fraud cases
      FraudCase.countDocuments({ status: "CONFIRMED_FRAUD" }).exec(),

      // Average risk score
      RiskAssessment.aggregate<AverageRiskRow>([
        {
          $group: {
            _id: null,
            averageRisk: { $avg: "$finalRisk" },
          },
        },
      ]).exec(),

      // Risk-level distribution
      RiskAssessment.aggregate<CountRow>([
        {
          $group: {
            _id: "$riskLevel",
            count: { $sum: 1 },
          },
        },
      ]).exec(),

      // Transaction status distribution
      Transaction.aggregate<CountRow>([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]).exec(),

      // Five most recent fraud cases
      FraudCase.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select({
          _id: 1,
          caseId: 1,
          customerId: 1,
          riskScore: 1,
          severity: 1,
          status: 1,
          title: 1,
          createdAt: 1,
        })
        .lean()
        .exec(),

      // Five most recent flagged transactions
      Transaction.find({ status: "FLAGGED" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select({
          _id: 1,
          transactionId: 1,
          customerId: 1,
          amount: 1,
          currency: 1,
          merchant: 1,
          transactionType: 1,
          status: 1,
          transactionTime: 1,
          createdAt: 1,
        })
        .lean()
        .exec(),

      // Transaction trend: last seven days
      Transaction.aggregate<TransactionTrendRow>([
        {
          $match: {
            createdAt: { $gte: last7DaysStart },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            total: { $sum: 1 },
            flagged: {
              $sum: {
                $cond: [{ $eq: ["$status", "FLAGGED"] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec(),

      // Average risk trend: last seven days
      RiskAssessment.aggregate<RiskTrendRow>([
        {
          $match: {
            createdAt: { $gte: last7DaysStart },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            averageRisk: { $avg: "$finalRisk" },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec(),
    ]);

    // =====================================================
    // DASHBOARD METRICS
    // =====================================================

    const averageRisk = roundToTwo(averageRiskResult[0]?.averageRisk);

    const flaggedRate =
      totalTransactions > 0
        ? roundToTwo((flaggedTransactions / totalTransactions) * 100)
        : 0;

    const confirmedFraudRate =
      totalCases > 0
        ? roundToTwo((confirmedFraudCases / totalCases) * 100)
        : 0;

    // =====================================================
    // NORMALIZE RISK DISTRIBUTION
    // =====================================================

    const riskDistribution: Record<RiskLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    for (const item of riskDistributionResult) {
      if (
        item._id !== null &&
        Object.prototype.hasOwnProperty.call(riskDistribution, item._id)
      ) {
        riskDistribution[item._id as RiskLevel] = item.count;
      }
    }

    // =====================================================
    // NORMALIZE TRANSACTION STATUS DISTRIBUTION
    // =====================================================

    const transactionStatus: Record<TransactionStatus, number> = {
      PENDING: 0,
      APPROVED: 0,
      DECLINED: 0,
      FLAGGED: 0,
    };

    for (const item of transactionStatusResult) {
      if (
        item._id !== null &&
        Object.prototype.hasOwnProperty.call(transactionStatus, item._id)
      ) {
        transactionStatus[item._id as TransactionStatus] = item.count;
      }
    }

    // =====================================================
    // FILL IN MISSING DAYS IN BOTH TRENDS
    // =====================================================

    const transactionTrendByDate = new Map(
      transactionTrendResult.map((item) => [item._id, item])
    );
    const riskTrendByDate = new Map(
      riskTrendResult.map((item) => [item._id, item])
    );

    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(last7DaysStart);
      date.setUTCDate(last7DaysStart.getUTCDate() + index);
      return date.toISOString().slice(0, 10);
    });

    const transactionTrend = dates.map((date) => ({
      date,
      total: transactionTrendByDate.get(date)?.total ?? 0,
      flagged: transactionTrendByDate.get(date)?.flagged ?? 0,
    }));

    const riskTrend = dates.map((date) => ({
      date,
      averageRisk: roundToTwo(riskTrendByDate.get(date)?.averageRisk),
    }));

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    res.status(200).json({
      success: true,
      message: "Dashboard overview fetched successfully",
      data: {
        metrics: {
          totalTransactions,
          flaggedTransactions,
          flaggedRate,
          totalCases,
          activeCases,
          criticalCases,
          confirmedFraudCases,
          confirmedFraudRate,
          averageRisk,
        },
        riskDistribution,
        transactionStatus,
        recentCases,
        recentFlaggedTransactions,
        transactionTrend,
        riskTrend,
      },
    });
  } catch (error: unknown) {
    console.error("Dashboard overview error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
