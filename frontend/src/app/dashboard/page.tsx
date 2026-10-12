
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import type {
  DashboardOverviewResponse,
  DashboardRecentCase,
  DashboardRecentTransaction,
} from "@/types/fraudshield";

// =====================================================
// HELPERS
// =====================================================

type DashboardData = DashboardOverviewResponse["data"];

function formatCurrency(amount?: number, currency = "INR"): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

function safeDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN");
}

function getSeverityClass(severity?: string): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-950 text-red-300";
    case "HIGH":
      return "bg-orange-950 text-orange-300";
    case "MEDIUM":
      return "bg-yellow-950 text-yellow-300";
    default:
      return "bg-green-950 text-green-300";
  }
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)}%` : "0%";
}

// =====================================================
// DASHBOARD PAGE
// =====================================================

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest<DashboardOverviewResponse>(
          "/dashboard/overview"
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || "Unable to load dashboard");
        }

        const data = response.data;
        if (!data.metrics || !data.riskDistribution || !data.transactionStatus) {
          throw new Error("Dashboard API response is missing required data");
        }

        if (active) {
          setDashboard(data);
        }
      } catch (err: unknown) {
        console.error("Dashboard loading error:", err);
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  // Hooks must all be above conditional returns.
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-cyan-400">FraudShield Intelligence</p>
          <p className="mt-5 text-slate-400">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-cyan-400">FraudShield Intelligence</p>
          <div role="alert" className="mt-8 rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-300">
            {error || "Dashboard data unavailable"}
          </div>
        </div>
      </main>
    );
  }

  const {
    metrics,
    riskDistribution,
    transactionStatus,
    transactionTrend = [],
    riskTrend = [],
  } = dashboard;

  const recentCases: DashboardRecentCase[] = Array.isArray(dashboard.recentCases)
    ? dashboard.recentCases
    : [];

  const recentTransactions: DashboardRecentTransaction[] = Array.isArray(
    dashboard.recentFlaggedTransactions
  )
    ? dashboard.recentFlaggedTransactions
    : [];

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              FraudShield Intelligence
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Fraud Intelligence Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Overview of transaction risk, fraud cases and investigation activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/transactions"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800"
            >
              Transactions
            </Link>
            <Link
              href="/cases"
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Fraud Cases
            </Link>
          </div>
        </div>

        {/* METRIC CARDS */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Transactions"
            value={metrics.totalTransactions}
            subtitle="Analyzed transactions"
          />
          <MetricCard
            title="Flagged Transactions"
            value={metrics.flaggedTransactions}
            subtitle={`${formatPercent(metrics.flaggedRate)} flagged`}
            alert={metrics.flaggedTransactions > 0}
          />
          <MetricCard
            title="Fraud Cases"
            value={metrics.totalCases}
            subtitle={`${metrics.activeCases} active`}
          />
          <MetricCard
            title="Critical Cases"
            value={metrics.criticalCases}
            subtitle="Critical severity"
            alert={metrics.criticalCases > 0}
          />
          <MetricCard
            title="Average Risk"
            value={metrics.averageRisk}
            subtitle="/ 100"
          />
          <MetricCard
            title="Confirmed Fraud"
            value={metrics.confirmedFraudCases}
            subtitle={`${formatPercent(metrics.confirmedFraudRate)} of cases`}
            alert={metrics.confirmedFraudCases > 0}
          />
          <MetricCard
            title="Active Cases"
            value={metrics.activeCases}
            subtitle="Require review"
          />
          <MetricCard
            title="Flagged Rate"
            value={formatPercent(metrics.flaggedRate)}
            subtitle="Of transactions"
          />
        </section>

        {/* CHARTS — data comes from the backend, never from mock values */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <DashboardCharts
            riskDistribution={riskDistribution}
            transactionStatus={transactionStatus}
            transactionTrend={Array.isArray(transactionTrend) ? transactionTrend : []}
            riskTrend={Array.isArray(riskTrend) ? riskTrend : []}
          />
          <DistributionCard
            title="Transaction Status"
            values={[
              { label: "APPROVED", value: transactionStatus.APPROVED },
              { label: "FLAGGED", value: transactionStatus.FLAGGED },
              { label: "DECLINED", value: transactionStatus.DECLINED },
              { label: "PENDING", value: transactionStatus.PENDING },
            ]}
          />
        </section>

        {/* RECENT FRAUD CASES */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 p-6">
            <div>
              <h2 className="text-xl font-semibold">Recent Fraud Cases</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest automatically generated investigation cases.
              </p>
            </div>
            <Link href="/cases" className="shrink-0 text-sm text-cyan-400 hover:text-cyan-300">
              View all →
            </Link>
          </div>

          {recentCases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-500">
                    <th className="px-6 py-4">Case</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Risk</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentCases.map((fraudCase) => (
                    <tr key={fraudCase._id || fraudCase.caseId} className="hover:bg-slate-800/40">
                      <td className="px-6 py-5 font-medium text-cyan-400">
                        {fraudCase.caseId}
                      </td>
                      <td className="px-6 py-5 text-slate-300">
                        {fraudCase.customerId}
                      </td>
                      <td className="px-6 py-5 font-semibold">
                        {fraudCase.riskScore}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`rounded-lg px-3 py-1 text-xs ${getSeverityClass(fraudCase.severity)}`}>
                          {fraudCase.severity}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-400">
                        {fraudCase.status}
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          href={`/cases/${encodeURIComponent(fraudCase.caseId)}`}
                          className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-sm text-slate-500">No fraud cases available.</p>
          )}
        </section>

        {/* RECENT FLAGGED TRANSACTIONS */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 p-6">
            <div>
              <h2 className="text-xl font-semibold">Recent Flagged Transactions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest transactions requiring investigation.
              </p>
            </div>
            <Link href="/transactions" className="shrink-0 text-sm text-cyan-400 hover:text-cyan-300">
              View all →
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction._id || transaction.transactionId}
                  className="flex flex-col justify-between gap-4 p-6 transition hover:bg-slate-800/40 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-medium text-cyan-400">
                      {transaction.transactionId}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {transaction.customerId || "Unknown customer"}
                      {" • "}
                      {transaction.transactionType || "Transaction"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-5">
                    <div>
                      <p className="text-xs text-slate-500">Amount</p>
                      <p className="mt-1 font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {safeDate(transaction.transactionTime)}
                      </p>
                    </div>
                    <Link
                      href={`/transactions/${encodeURIComponent(transaction.transactionId)}`}
                      className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-slate-500">
              No flagged transactions available.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

// =====================================================
// METRIC CARD
// =====================================================

function MetricCard({
  title,
  value,
  subtitle,
  alert = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        alert ? "border-red-900 bg-red-950/20" : "border-slate-800 bg-slate-900"
      }`}
    >
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-3 text-3xl font-bold ${alert ? "text-red-300" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

// =====================================================
// DISTRIBUTION CARD
// =====================================================

function DistributionCard({
  title,
  values,
}: {
  title: string;
  values: { label: string; value: number }[];
}) {
  const safeValues = values.map((item) => ({
    ...item,
    value: Number.isFinite(item.value) ? Math.max(item.value, 0) : 0,
  }));

  const total = safeValues.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-6 space-y-5">
        {safeValues.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-400">{item.label}</span>
                <span className="font-medium">
                  {item.value}
                  <span className="ml-2 text-xs text-slate-500">
                    {percentage.toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
