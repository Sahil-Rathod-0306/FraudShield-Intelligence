"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  apiRequest,
} from "@/lib/api";

import type {
  RiskAssessment,
  Transaction,
  TransactionCaseSummary,
  TransactionDetailResponse,
} from "@/types/fraudshield";


// =====================================================
// HELPERS
// =====================================================

function formatCurrency(
  amount: number,
  currency: string
) {

  try {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);

  } catch {

    return `${currency} ${amount.toLocaleString()}`;
  }
}


function safeDate(
  value?: string
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return date.toLocaleString();
}


function getRiskColor(
  risk: number
) {

  if (risk >= 80) {
    return "text-red-400";
  }

  if (risk >= 60) {
    return "text-orange-400";
  }

  if (risk >= 30) {
    return "text-yellow-400";
  }

  return "text-green-400";
}


function getRiskBarColor(
  risk: number
) {

  if (risk >= 80) {
    return "bg-red-500";
  }

  if (risk >= 60) {
    return "bg-orange-500";
  }

  if (risk >= 30) {
    return "bg-yellow-500";
  }

  return "bg-green-500";
}


function getStatusStyle(
  status: string
) {

  switch (status) {

    case "FLAGGED":
      return "border-red-900 bg-red-950 text-red-300";

    case "DECLINED":
      return "border-orange-900 bg-orange-950 text-orange-300";

    case "APPROVED":
      return "border-green-900 bg-green-950 text-green-300";

    case "PENDING":
      return "border-yellow-900 bg-yellow-950 text-yellow-300";

    default:
      return "border-slate-700 bg-slate-800 text-slate-300";
  }
}


// =====================================================
// PAGE
// =====================================================

export default function TransactionDetailPage() {

  const params =
    useParams();


  const transactionId =
    String(
      params.transactionId ??
      ""
    );


  const [
    transaction,
    setTransaction,
  ] =
    useState<Transaction | null>(
      null
    );


  const [
    risk,
    setRisk,
  ] =
    useState<RiskAssessment | null>(
      null
    );


  const [
    fraudCase,
    setFraudCase,
  ] =
    useState<TransactionCaseSummary | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {

    if (!transactionId) {
      return;
    }


    const loadTransaction =
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await apiRequest<TransactionDetailResponse>(
              `/transactions/${transactionId}`
            );


          setTransaction(
            response.data.transaction
          );


          setRisk(
            response.data.riskAssessment
          );


          setFraudCase(
            response.data.fraudCase
          );


        } catch (error) {

          console.error(
            "Transaction loading error:",
            error
          );


          setError(
            error instanceof Error
              ? error.message
              : "Failed to load transaction"
          );


        } finally {

          setLoading(false);

        }
      };


    void loadTransaction();

  }, [transactionId]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <main
        className="
          min-h-screen
          bg-slate-950
          p-8
          text-white
        "
      >

        <div className="mx-auto max-w-7xl">

          <p className="text-cyan-400">
            FraudShield Intelligence
          </p>

          <p className="mt-5 text-slate-400">
            Loading transaction analysis...
          </p>

        </div>

      </main>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (
    error ||
    !transaction
  ) {

    return (

      <main
        className="
          min-h-screen
          bg-slate-950
          p-8
          text-white
        "
      >

        <div className="mx-auto max-w-7xl">

          <Link
            href="/transactions"
            className="text-cyan-400"
          >
            ← Back to Transactions
          </Link>


          <div
            className="
              mt-8
              rounded-xl
              border
              border-red-800
              bg-red-950/40
              p-5
              text-red-300
            "
          >
            {
              error ||
              "Transaction not found"
            }
          </div>

        </div>

      </main>
    );
  }


  const behavior =
    risk?.behaviorSignals;


  return (

    <main
      className="
        min-h-screen
        bg-slate-950
        px-5
        py-8
        text-white
        md:px-8
      "
    >

      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            BACK
        ===================================================== */}

        <Link
          href="/transactions"
          className="
            text-sm
            text-cyan-400
            hover:text-cyan-300
          "
        >
          ← Back to Transactions
        </Link>


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            mt-6
            flex
            flex-col
            justify-between
            gap-5
            md:flex-row
            md:items-center
          "
        >

          <div>

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.25em]
                text-cyan-400
              "
            >
              Transaction Intelligence
            </p>


            <h1
              className="
                mt-3
                break-all
                text-3xl
                font-bold
                md:text-4xl
              "
            >
              {transaction.transactionId}
            </h1>


            <p
              className="
                mt-2
                text-slate-400
              "
            >
              Automated fraud risk analysis
            </p>

          </div>


          <span
            className={`
              w-fit
              rounded-xl
              border
              px-4
              py-2
              text-sm
              font-semibold

              ${
                getStatusStyle(
                  transaction.status
                )
              }
            `}
          >
            {transaction.status}
          </span>

        </div>


        {/* =====================================================
            TRANSACTION INFO
        ===================================================== */}

        <section
          className="
            mt-8
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-6
          "
        >

          <h2
            className="
              text-xl
              font-semibold
            "
          >
            Transaction Details
          </h2>


          <div
            className="
              mt-6
              grid
              gap-6
              md:grid-cols-2
              lg:grid-cols-3
            "
          >

            <Info
              label="Customer ID"
              value={
                transaction.customerId
              }
            />


            <Info
              label="Amount"
              value={
                formatCurrency(
                  transaction.amount,
                  transaction.currency
                )
              }
            />


            <Info
              label="Transaction Type"
              value={
                transaction.transactionType
              }
            />


            <Info
              label="Merchant"
              value={
                transaction.merchant ??
                "-"
              }
            />


            <Info
              label="Device ID"
              value={
                transaction.deviceId ??
                "-"
              }
            />


            <Info
              label="IP Address"
              value={
                transaction.ipAddress ??
                "-"
              }
            />


            <Info
              label="Location"
              value={
                [
                  transaction.location?.city,
                  transaction.location?.state,
                  transaction.location?.country,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                "-"
              }
            />


            <Info
              label="Transaction Time"
              value={
                safeDate(
                  transaction.transactionTime
                )
              }
            />


            <Info
              label="Created At"
              value={
                safeDate(
                  transaction.createdAt
                )
              }
            />

          </div>

        </section>


        {/* =====================================================
            RISK ANALYSIS
        ===================================================== */}

        {risk ? (

          <>

            <section
              className="
                mt-6
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                p-6
              "
            >

              <div
                className="
                  flex
                  flex-col
                  justify-between
                  gap-4
                  md:flex-row
                  md:items-center
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Final Risk Score
                  </p>


                  <div
                    className="
                      mt-2
                      flex
                      items-end
                      gap-2
                    "
                  >

                    <p
                      className={`
                        text-5xl
                        font-bold

                        ${
                          getRiskColor(
                            risk.finalRisk
                          )
                        }
                      `}
                    >
                      {risk.finalRisk}
                    </p>

                    <p
                      className="
                        mb-1
                        text-slate-500
                      "
                    >
                      / 100
                    </p>

                  </div>

                </div>


                <div>

                  <p className="text-slate-500">
                    Risk Level
                  </p>

                  <p
                    className="
                      mt-1
                      text-2xl
                      font-semibold
                    "
                  >
                    {risk.riskLevel}
                  </p>

                </div>

              </div>


              <div
                className="
                  mt-6
                  h-3
                  overflow-hidden
                  rounded-full
                  bg-slate-800
                "
              >

                <div
                  className={`
                    h-full
                    rounded-full

                    ${
                      getRiskBarColor(
                        risk.finalRisk
                      )
                    }
                  `}
                  style={{
                    width:
                      `${
                        Math.min(
                          Math.max(
                            risk.finalRisk,
                            0
                          ),
                          100
                        )
                      }%`,
                  }}
                />

              </div>

            </section>


            {/* RISK COMPONENTS */}

            <section
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >

              <RiskCard
                title="Rule Risk"
                value={
                  risk.ruleRisk
                }
              />


              <RiskCard
                title="Behavior Risk"
                value={
                  risk.behaviorRisk
                }
              />


              <RiskCard
                title="ML Risk"
                value={
                  risk.mlRisk
                }
              />


              <RiskCard
                title="Graph Risk"
                value={
                  risk.graphRisk ??
                  0
                }
              />

            </section>


            {/* BEHAVIOR */}

            <section
              className="
                mt-6
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                p-6
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Behavioral Signals
              </h2>


              <div
                className="
                  mt-6
                  grid
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >

                <SignalCard
                  label="History Count"
                  value={
                    String(
                      behavior?.historyCount ??
                      0
                    )
                  }
                />


                <SignalCard
                  label="Average Amount"
                  value={
                    formatCurrency(
                      behavior?.averageAmount ??
                      0,
                      transaction.currency
                    )
                  }
                />


                <SignalCard
                  label="Amount Ratio"
                  value={
                    `${
                      behavior?.amountRatio ??
                      0
                    }x`
                  }
                  alert={
                    (
                      behavior?.amountRatio ??
                      0
                    ) >= 3
                  }
                />


                <SignalCard
                  label="Recent 10 Min"
                  value={
                    String(
                      behavior?.recent10MinCount ??
                      0
                    )
                  }
                />


                <SignalCard
                  label="New Device"
                  value={
                    behavior?.isNewDevice
                      ? "YES"
                      : "NO"
                  }
                  alert={
                    behavior?.isNewDevice ??
                    false
                  }
                />


                <SignalCard
                  label="New Location"
                  value={
                    behavior?.isNewLocation
                      ? "YES"
                      : "NO"
                  }
                  alert={
                    behavior?.isNewLocation ??
                    false
                  }
                />


                <SignalCard
                  label="Unusual Hour"
                  value={
                    behavior?.unusualHour
                      ? "YES"
                      : "NO"
                  }
                  alert={
                    behavior?.unusualHour ??
                    false
                  }
                />

              </div>

            </section>


            {/* REASONS */}

            <section
              className="
                mt-6
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                p-6
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Detection Reasons
              </h2>


              {
                risk.reasons &&
                risk.reasons.length >
                0
                  ? (

                  <div
                    className="
                      mt-5
                      space-y-3
                    "
                  >

                    {
                      risk.reasons.map(
                        (
                          reason,
                          index
                        ) => (

                        <div
                          key={
                            `${reason}-${index}`
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-800
                            bg-slate-950
                            p-4
                            text-sm
                            text-slate-300
                          "
                        >
                          {reason}
                        </div>

                      ))
                    }

                  </div>

                ) : (

                  <p
                    className="
                      mt-5
                      text-sm
                      text-slate-500
                    "
                  >
                    No risk reasons recorded.
                  </p>

                )
              }

            </section>

          </>

        ) : (

          <section
            className="
              mt-6
              rounded-2xl
              border
              border-yellow-900
              bg-yellow-950/20
              p-6
            "
          >

            <p className="text-yellow-300">
              No risk assessment found for
              this transaction.
            </p>

          </section>

        )}


        {/* =====================================================
            FRAUD CASE
        ===================================================== */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-cyan-900
            bg-slate-900
            p-6
          "
        >

          <h2
            className="
              text-xl
              font-semibold
            "
          >
            Fraud Case
          </h2>


          {fraudCase ? (

            <div
              className="
                mt-5
                flex
                flex-col
                justify-between
                gap-5
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                p-5
                md:flex-row
                md:items-center
              "
            >

              <div>

                <p
                  className="
                    font-semibold
                    text-cyan-400
                  "
                >
                  {fraudCase.caseId}
                </p>


                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-400
                  "
                >
                  {
                    fraudCase.title ??
                    "Fraud investigation case"
                  }
                </p>


                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    gap-3
                    text-xs
                  "
                >

                  <span
                    className="
                      rounded-lg
                      bg-orange-950
                      px-3
                      py-1
                      text-orange-300
                    "
                  >
                    {
                      fraudCase.severity
                    }
                  </span>


                  <span
                    className="
                      rounded-lg
                      bg-slate-800
                      px-3
                      py-1
                      text-slate-300
                    "
                  >
                    {
                      fraudCase.status
                    }
                  </span>

                </div>

              </div>


              <Link
                href={
                  `/cases/${
                    fraudCase.caseId
                  }`
                }
                className="
                  w-fit
                  rounded-xl
                  bg-cyan-400
                  px-5
                  py-3
                  font-semibold
                  text-slate-950
                  transition
                  hover:bg-cyan-300
                "
              >
                Open Fraud Case
              </Link>

            </div>

          ) : (

            <div
              className="
                mt-5
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                p-5
              "
            >

              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                No fraud case was created for
                this transaction.
              </p>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}


// =====================================================
// INFO
// =====================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {

  return (

    <div>

      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-slate-500
        "
      >
        {label}
      </p>


      <p
        className="
          mt-2
          break-all
          text-sm
          font-medium
          text-slate-200
        "
      >
        {value}
      </p>

    </div>
  );
}


// =====================================================
// RISK CARD
// =====================================================

function RiskCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  const safeValue =
    Number.isFinite(
      value
    )
      ? value
      : 0;


  return (

    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-5
      "
    >

      <p className="text-sm text-slate-500">
        {title}
      </p>


      <p
        className={`
          mt-2
          text-3xl
          font-bold

          ${
            getRiskColor(
              safeValue
            )
          }
        `}
      >
        {safeValue}
      </p>


      <div
        className="
          mt-4
          h-2
          overflow-hidden
          rounded-full
          bg-slate-800
        "
      >

        <div
          className={`
            h-full
            rounded-full

            ${
              getRiskBarColor(
                safeValue
              )
            }
          `}
          style={{
            width:
              `${
                Math.min(
                  Math.max(
                    safeValue,
                    0
                  ),
                  100
                )
              }%`,
          }}
        />

      </div>

    </div>
  );
}


// =====================================================
// SIGNAL CARD
// =====================================================

function SignalCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {

  return (

    <div
      className={`
        rounded-xl
        border
        p-4

        ${
          alert
            ? "border-red-900 bg-red-950/30"
            : "border-slate-800 bg-slate-950"
        }
      `}
    >

      <p
        className="
          text-xs
          uppercase
          text-slate-500
        "
      >
        {label}
      </p>


      <p
        className={`
          mt-2
          text-lg
          font-semibold

          ${
            alert
              ? "text-red-300"
              : "text-slate-200"
          }
        `}
      >
        {value}
      </p>

    </div>
  );
}