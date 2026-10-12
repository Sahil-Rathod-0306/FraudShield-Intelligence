"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  apiRequest,
} from "@/lib/api";

import type {
  AIInvestigationResponse,
  CaseDetailResponse,
  FraudCase,
  FraudEvidence,
  RiskAssessment,
  Transaction,
} from "@/types/fraudshield";


// =====================================================
// HELPERS
// =====================================================

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


function getSeverityClasses(
  severity: string
) {
  switch (severity) {

    case "CRITICAL":
      return "border-red-700 bg-red-950/50 text-red-300";

    case "HIGH":
      return "border-orange-700 bg-orange-950/50 text-orange-300";

    case "MEDIUM":
      return "border-yellow-700 bg-yellow-950/50 text-yellow-300";

    case "LOW":
      return "border-green-700 bg-green-950/50 text-green-300";

    default:
      return "border-slate-700 bg-slate-900 text-slate-300";
  }
}


function getStatusClasses(
  status: string
) {
  switch (status) {

    case "OPEN":
      return "bg-blue-950 text-blue-300";

    case "INVESTIGATING":
      return "bg-purple-950 text-purple-300";

    case "ESCALATED":
      return "bg-orange-950 text-orange-300";

    case "CONFIRMED_FRAUD":
      return "bg-red-950 text-red-300";

    case "FALSE_POSITIVE":
      return "bg-green-950 text-green-300";

    case "CLOSED":
      return "bg-slate-800 text-slate-300";

    default:
      return "bg-slate-800 text-slate-300";
  }
}


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


// =====================================================
// PAGE
// =====================================================

export default function CaseDetailPage() {

  const params =
    useParams();


  const caseId =
    String(
      params.caseId ?? ""
    );


  // =====================================================
  // STATE
  // =====================================================

  const [
    fraudCase,
    setFraudCase,
  ] =
    useState<FraudCase | null>(
      null
    );


  const [
    transaction,
    setTransaction,
  ] =
    useState<Transaction | null>(
      null
    );


  const [
    riskAssessment,
    setRiskAssessment,
  ] =
    useState<RiskAssessment | null>(
      null
    );


  const [
    fraudEvidence,
    setFraudEvidence,
  ] =
    useState<FraudEvidence | null>(
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


  const [
    investigating,
    setInvestigating,
  ] =
    useState(false);


  const [
    investigationReport,
    setInvestigationReport,
  ] =
    useState("");


  const [
    investigationModel,
    setInvestigationModel,
  ] =
    useState("");


  // =====================================================
  // LOAD FRAUD CASE
  // =====================================================

  useEffect(() => {

    if (!caseId) {
      return;
    }


    const loadCase =
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await apiRequest<CaseDetailResponse>(
              `/cases/${caseId}`
            );


          const caseData =
            response.data
              .fraudCase ??
            response.data
              .case ??
            null;


          if (!caseData) {

            throw new Error(
              "Fraud case was not returned by the backend"
            );
          }


          // ---------------------------------------------
          // TRANSACTION
          // ---------------------------------------------

          const transactionData =
            response.data
              .transaction ??
            (
              typeof caseData
                .transactionId ===
              "string"
                ? null
                : caseData
                    .transactionId
            );


          // ---------------------------------------------
          // RISK ASSESSMENT
          // ---------------------------------------------

          const riskData =
            response.data
              .riskAssessment ??
            (
              typeof caseData
                .riskAssessmentId ===
              "string"
                ? null
                : caseData
                    .riskAssessmentId
            );


          // ---------------------------------------------
          // SAVE STATE
          // ---------------------------------------------

          setFraudCase(
            caseData
          );


          setTransaction(
            transactionData
          );


          setRiskAssessment(
            riskData
          );


          setFraudEvidence(
            response.data
              .fraudEvidence ??
            null
          );


        } catch (err) {

          console.error(
            "Case loading error:",
            err
          );


          setError(
            err instanceof Error
              ? err.message
              : "Failed to load fraud case"
          );


          setFraudCase(
            null
          );

          setTransaction(
            null
          );

          setRiskAssessment(
            null
          );

          setFraudEvidence(
            null
          );

        } finally {

          setLoading(false);

        }
      };


    void loadCase();

  }, [caseId]);


  // =====================================================
  // AI INVESTIGATION
  // =====================================================

  const investigateWithAI =
    async () => {

      if (
        !caseId ||
        investigating
      ) {
        return;
      }


      try {

        setInvestigating(
          true
        );

        setError("");


        const response =
          await apiRequest<AIInvestigationResponse>(
            `/ai/cases/${caseId}/investigate`,
            {
              method:
                "POST",
            }
          );


        setInvestigationReport(
          response.data.report ??
          ""
        );


        setInvestigationModel(
          response.data.model ??
          ""
        );


      } catch (err) {

        console.error(
          "AI investigation error:",
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "AI investigation failed"
        );


      } finally {

        setInvestigating(
          false
        );

      }
    };


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

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          <p className="text-cyan-400">
            FraudShield Intelligence
          </p>


          <p
            className="
              mt-5
              text-slate-400
            "
          >
            Loading fraud investigation...
          </p>

        </div>

      </main>
    );
  }


  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!fraudCase) {

    return (

      <main
        className="
          min-h-screen
          bg-slate-950
          p-8
          text-white
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          <Link
            href="/cases"
            className="text-cyan-400"
          >
            ← Back to Cases
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
              "Fraud case could not be loaded."
            }

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // NORMALIZED RISK DATA
  // =====================================================

  const risk: RiskAssessment =
    riskAssessment ?? {

      ruleRisk: 0,

      behaviorRisk: 0,

      mlRisk: 0,

      graphRisk: 0,

      finalRisk:
        fraudCase.riskScore ??
        0,

      riskLevel:
        fraudCase.severity,

      reasons:
        [],

      behaviorReasons:
        [],

      behaviorSignals:
        {},

      modelVersion:
        "Unavailable",
    };


  const behaviorSignals = {

    historyCount:
      risk.behaviorSignals
        ?.historyCount ??
      0,

    averageAmount:
      risk.behaviorSignals
        ?.averageAmount ??
      0,

    amountRatio:
      risk.behaviorSignals
        ?.amountRatio ??
      0,

    recent10MinCount:
      risk.behaviorSignals
        ?.recent10MinCount ??
      0,

    isNewDevice:
      risk.behaviorSignals
        ?.isNewDevice ??
      false,

    isNewLocation:
      risk.behaviorSignals
        ?.isNewLocation ??
      false,

    unusualHour:
      risk.behaviorSignals
        ?.unusualHour ??
      false,
  };


  const allReasons =
    risk.reasons ??
    fraudCase.evidence ??
    [];


  const behaviorReasons =
    fraudEvidence
      ?.behaviorEvidence
      ?.length
      ? fraudEvidence
          .behaviorEvidence
      : risk
          .behaviorReasons ??
        [];


  const ruleReasons =
    fraudEvidence
      ?.ruleEvidence
      ?.length
      ? fraudEvidence
          .ruleEvidence
      : undefined;


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

      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        {/* =====================================================
            BACK
        ===================================================== */}

        <Link
          href="/cases"
          className="
            text-sm
            text-cyan-400
            transition
            hover:text-cyan-300
          "
        >
          ← Back to Fraud Cases
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
              FraudShield Intelligence
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
              {fraudCase.caseId}
            </h1>


            <p
              className="
                mt-2
                text-slate-400
              "
            >
              {
                fraudCase.title ??
                "Fraud investigation case"
              }
            </p>

          </div>


          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >

            <span
              className={`
                rounded-xl
                border
                px-4
                py-2
                text-sm
                font-semibold

                ${
                  getSeverityClasses(
                    fraudCase.severity
                  )
                }
              `}
            >
              {fraudCase.severity}
            </span>


            <span
              className={`
                rounded-xl
                px-4
                py-2
                text-sm
                font-semibold

                ${
                  getStatusClasses(
                    fraudCase.status
                  )
                }
              `}
            >
              {fraudCase.status}
            </span>

          </div>

        </div>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div
            className="
              mt-6
              rounded-xl
              border
              border-red-800
              bg-red-950/40
              p-4
              text-red-300
            "
          >
            {error}
          </div>

        )}


        {/* =====================================================
            CASE SUMMARY
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
              text-lg
              font-semibold
            "
          >
            Case Summary
          </h2>


          <p
            className="
              mt-3
              leading-7
              text-slate-400
            "
          >
            {
              fraudCase.description ??
              "No case description is available."
            }
          </p>


          <div
            className="
              mt-5
              grid
              gap-4
              md:grid-cols-3
            "
          >

            <Info
              label="Customer"
              value={
                fraudCase.customerId
              }
            />


            <Info
              label="Created"
              value={
                safeDate(
                  fraudCase.createdAt
                )
              }
            />


            <Info
              label="Assigned Investigator"
              value={
                typeof fraudCase
                  .assignedTo ===
                "string"
                  ? fraudCase
                      .assignedTo
                  : "Not assigned"
              }
            />

          </div>

        </section>


        {/* =====================================================
            OVERALL RISK
        ===================================================== */}

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
              gap-5
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
                Overall Fraud Risk
              </p>


              <div
                className="
                  mt-2
                  flex
                  items-end
                  gap-3
                "
              >

                <p
                  className={`
                    text-5xl
                    font-bold

                    ${
                      getRiskColor(
                        fraudCase.riskScore
                      )
                    }
                  `}
                >
                  {fraudCase.riskScore}
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

              <p className="text-slate-400">
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
                    fraudCase.riskScore
                  )
                }
              `}
              style={{
                width:
                  `${
                    Math.max(
                      0,
                      Math.min(
                        fraudCase.riskScore,
                        100
                      )
                    )
                  }%`,
              }}
            />

          </div>

        </section>


        {/* =====================================================
            RISK CARDS
        ===================================================== */}

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


        {/* =====================================================
            TRANSACTION
        ===================================================== */}

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
              gap-3
              md:flex-row
              md:items-center
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


            {transaction && (

              <span
                className="
                  w-fit
                  rounded-lg
                  bg-red-950
                  px-3
                  py-1
                  text-sm
                  font-semibold
                  text-red-300
                "
              >
                {transaction.status}
              </span>

            )}

          </div>


          {transaction ? (

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
                label="Transaction ID"
                value={
                  transaction
                    .transactionId
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
                  transaction
                    .transactionType
                }
              />


              <Info
                label="Merchant"
                value={
                  transaction
                    .merchant ??
                  "-"
                }
              />


              <Info
                label="Device ID"
                value={
                  transaction
                    .deviceId ??
                  "-"
                }
              />


              <Info
                label="IP Address"
                value={
                  transaction
                    .ipAddress ??
                  "-"
                }
              />


              <Info
                label="Location"
                value={
                  [
                    transaction
                      .location
                      ?.city,

                    transaction
                      .location
                      ?.state,

                    transaction
                      .location
                      ?.country,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(", ") ||
                  "-"
                }
              />


              <Info
                label="Transaction Time"
                value={
                  safeDate(
                    transaction
                      .transactionTime
                  )
                }
              />


              <Info
                label="Customer ID"
                value={
                  transaction
                    .customerId
                }
              />

            </div>

          ) : (

            <p
              className="
                mt-5
                text-sm
                text-slate-500
              "
            >
              Transaction details were not
              populated by the backend.
            </p>

          )}

        </section>


        {/* =====================================================
            BEHAVIOR ANALYSIS
        ===================================================== */}

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
            Behavioral Analysis
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
                  behaviorSignals
                    .historyCount
                )
              }
            />


            <SignalCard
              label="Average Amount"
              value={
                formatCurrency(
                  behaviorSignals
                    .averageAmount,

                  transaction
                    ?.currency ??
                  "INR"
                )
              }
            />


            <SignalCard
              label="Amount Ratio"
              value={
                `${
                  behaviorSignals
                    .amountRatio
                }x`
              }
              alert={
                behaviorSignals
                  .amountRatio >=
                3
              }
            />


            <SignalCard
              label="Recent 10 Min"
              value={
                String(
                  behaviorSignals
                    .recent10MinCount
                )
              }
            />


            <SignalCard
              label="New Device"
              value={
                behaviorSignals
                  .isNewDevice
                  ? "YES"
                  : "NO"
              }
              alert={
                behaviorSignals
                  .isNewDevice
              }
            />


            <SignalCard
              label="New Location"
              value={
                behaviorSignals
                  .isNewLocation
                  ? "YES"
                  : "NO"
              }
              alert={
                behaviorSignals
                  .isNewLocation
              }
            />


            <SignalCard
              label="Unusual Hour"
              value={
                behaviorSignals
                  .unusualHour
                  ? "YES"
                  : "NO"
              }
              alert={
                behaviorSignals
                  .unusualHour
              }
            />

          </div>

        </section>


        {/* =====================================================
            EVIDENCE
        ===================================================== */}

        <EvidenceSection
          allReasons={
            allReasons
          }
          behaviorReasons={
            behaviorReasons
          }
          storedRuleReasons={
            ruleReasons
          }
        />


        {/* =====================================================
            ML ANALYSIS
        ===================================================== */}

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

              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Machine Learning Analysis
              </h2>


              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                "
              >
                Fraud prediction model signal
              </p>

            </div>


            <span
              className="
                rounded-xl
                bg-slate-950
                px-4
                py-2
                text-sm
                text-slate-300
              "
            >
              {
                risk.modelVersion ??
                "Unavailable"
              }
            </span>

          </div>


          <div
            className="
              mt-6
              grid
              gap-4
              md:grid-cols-2
            "
          >

            <RiskCard
              title="ML Fraud Risk"
              value={
                fraudEvidence
                  ?.mlRisk ??
                risk.mlRisk
              }
            />


            <div
              className="
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
                  text-slate-500
                "
              >
                Model Evidence
              </p>


              <p
                className="
                  mt-3
                  leading-7
                  text-slate-300
                "
              >

                {
                  allReasons.find(
                    (
                      reason
                    ) =>
                      reason
                        .toLowerCase()
                        .includes(
                          "ml model"
                        )
                  ) ??

                  (
                    fraudEvidence
                      ?.mlPrediction
                      ? `ML prediction: ${
                          fraudEvidence
                            .mlPrediction
                        } ${
                          typeof fraudEvidence
                            .mlProbability ===
                          "number"
                            ? `(${(
                                fraudEvidence
                                  .mlProbability *
                                100
                              ).toFixed(
                                2
                              )}%)`
                            : ""
                        }`
                      : "No ML explanation available."
                  )
                }

              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            SHAP EXPLAINABILITY
        ===================================================== */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-cyan-950
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
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-400
                "
              >
                Explainable AI
              </p>


              <h2
                className="
                  mt-2
                  text-xl
                  font-semibold
                "
              >
                SHAP Model Explanation
              </h2>


              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Shows which ML model features
                increased or reduced the fraud
                prediction.
              </p>

            </div>


            {fraudEvidence && (

              <div
                className="
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  px-5
                  py-3
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    text-slate-500
                  "
                >
                  ML Prediction
                </p>


                <p
                  className={`
                    mt-1
                    font-semibold

                    ${
                      fraudEvidence
                        .mlPrediction ===
                      "FRAUD"
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  `}
                >
                  {
                    fraudEvidence
                      .mlPrediction
                  }
                </p>

              </div>

            )}

          </div>


          {fraudEvidence ? (

            <>

              {/* ML METRICS */}

              <div
                className="
                  mt-6
                  grid
                  gap-4
                  sm:grid-cols-2
                "
              >

                <div
                  className="
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
                      text-slate-500
                    "
                  >
                    Fraud Probability
                  </p>


                  <p
                    className="
                      mt-2
                      text-3xl
                      font-bold
                      text-orange-400
                    "
                  >

                    {
                      (
                        (fraudEvidence.mlProbability ?? 0) *
                        100
                      ).toFixed(
                        2
                      )
                    }%

                  </p>

                </div>


                <div
                  className="
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
                      text-slate-500
                    "
                  >
                    ML Risk Score
                  </p>


                  <p
                    className="
                      mt-2
                      text-3xl
                      font-bold
                    "
                  >
                    {
                      fraudEvidence
                        .mlRisk
                    }

                    <span
                      className="
                        ml-2
                        text-base
                        font-normal
                        text-slate-500
                      "
                    >
                      / 100
                    </span>

                  </p>

                </div>

              </div>


              {/* SHAP FEATURES */}

              {
                fraudEvidence
                  .mlEvidence &&
                fraudEvidence
                  .mlEvidence
                  .length >
                0
                  ? (

                  <div
                    className="
                      mt-6
                      space-y-4
                    "
                  >

                    {
                      fraudEvidence
                        .mlEvidence
                        .map(
                          (
                            item,
                            index
                          ) => {

                            const positive =
                              item
                                .contribution >=
                              0;


                            const magnitude =
                              Math.min(
                                Math.abs(
                                  item
                                    .contribution
                                ) *
                                  100,
                                100
                              );


                            return (

                              <div
                                key={
                                  `${item.feature}-${index}`
                                }
                                className="
                                  rounded-xl
                                  border
                                  border-slate-800
                                  bg-slate-950
                                  p-5
                                "
                              >

                                <div
                                  className="
                                    flex
                                    flex-col
                                    justify-between
                                    gap-4
                                    sm:flex-row
                                    sm:items-center
                                  "
                                >

                                  <div>

                                    <p
                                      className="
                                        font-medium
                                        text-slate-200
                                      "
                                    >
                                      {
                                        item.feature
                                      }
                                    </p>


                                    {
                                      typeof item
                                        .value ===
                                      "number" && (

                                      <p
                                        className="
                                          mt-1
                                          text-xs
                                          text-slate-500
                                        "
                                      >
                                        Feature value:
                                        {" "}
                                        {
                                          item.value
                                        }
                                      </p>

                                    )}

                                  </div>


                                  <div
                                    className="
                                      sm:text-right
                                    "
                                  >

                                    <p
                                      className={`
                                        font-mono
                                        text-lg
                                        font-semibold

                                        ${
                                          positive
                                            ? "text-red-400"
                                            : "text-green-400"
                                        }
                                      `}
                                    >

                                      {
                                        positive
                                          ? "+"
                                          : ""
                                      }

                                      {
                                        item
                                          .contribution
                                          .toFixed(
                                            4
                                          )
                                      }

                                    </p>


                                    <p
                                      className="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                      "
                                    >

                                      {
                                        positive
                                          ? "Increases fraud prediction"
                                          : "Reduces fraud prediction"
                                      }

                                    </p>

                                  </div>

                                </div>


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
                                        positive
                                          ? "bg-red-500"
                                          : "bg-green-500"
                                      }
                                    `}
                                    style={{
                                      width:
                                        `${magnitude}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            );
                          }
                        )
                    }

                  </div>

                ) : (

                  <div
                    className="
                      mt-6
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
                        text-slate-500
                      "
                    >
                      No stored SHAP explanation
                      is available for this
                      transaction.
                    </p>

                  </div>

                )
              }

            </>

          ) : (

            <div
              className="
                mt-6
                rounded-xl
                border
                border-yellow-900
                bg-yellow-950/20
                p-5
              "
            >

              <p
                className="
                  font-medium
                  text-yellow-300
                "
              >
                FraudEvidence not available
              </p>


              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                This case may have been created
                before the Evidence Engine was
                added. Create a new suspicious
                transaction to generate and store
                SHAP evidence.
              </p>

            </div>

          )}

        </section>


        {/* =====================================================
            AI INVESTIGATOR
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

          <div
            className="
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
                  tracking-[0.2em]
                  text-cyan-400
                "
              >
                Local AI
              </p>


              <h2
                className="
                  mt-2
                  text-2xl
                  font-semibold
                "
              >
                AI Fraud Investigator
              </h2>


              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                Review transaction,
                behavioral risk, model
                signals and historical
                evidence using your local
                Ollama investigator.
              </p>

            </div>


            <button
              type="button"
              onClick={
                investigateWithAI
              }
              disabled={
                investigating
              }
              className="
                rounded-xl
                bg-cyan-400
                px-6
                py-3
                font-semibold
                text-slate-950
                transition
                hover:bg-cyan-300
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {
                investigating
                  ? "Investigating..."
                  : "Investigate with AI"
              }

            </button>

          </div>


          {investigating && (

            <div
              className="
                mt-6
                rounded-xl
                border
                border-cyan-950
                bg-slate-950
                p-5
              "
            >

              <p
                className="
                  font-medium
                  text-cyan-400
                "
              >
                AI investigation in progress...
              </p>


              <div
                className="
                  mt-4
                  space-y-2
                  text-sm
                  text-slate-500
                "
              >
                <p>
                  • Reviewing transaction details
                </p>

                <p>
                  • Analyzing behavioral signals
                </p>

                <p>
                  • Reviewing ML and SHAP evidence
                </p>

                <p>
                  • Generating investigation report
                </p>
              </div>

            </div>

          )}


          {investigationReport && (

            <div
              className="
                mt-6
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                p-6
              "
            >

              <div
                className="
                  mb-5
                  flex
                  flex-col
                  justify-between
                  gap-3
                  md:flex-row
                  md:items-center
                "
              >

                <h3
                  className="
                    text-xl
                    font-semibold
                  "
                >
                  AI Investigation Report
                </h3>


                <span
                  className="
                    w-fit
                    rounded-lg
                    bg-slate-800
                    px-3
                    py-1
                    text-xs
                    text-slate-400
                  "
                >
                  {
                    investigationModel ||
                    "Unknown model"
                  }
                </span>

              </div>


              <div
                className="
                  whitespace-pre-wrap
                  text-sm
                  leading-7
                  text-slate-300
                "
              >
                {investigationReport}
              </div>

            </div>

          )}

        </section>


        {/* =====================================================
            RESOLUTION
        ===================================================== */}

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
            Case Resolution
          </h2>


          <p
            className="
              mt-3
              text-slate-400
            "
          >
            {
              fraudCase.resolution ??
              "No resolution has been recorded yet."
            }
          </p>

        </section>

      </div>

    </main>
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

      <p
        className="
          text-sm
          text-slate-500
        "
      >
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
                Math.max(
                  0,
                  Math.min(
                    safeValue,
                    100
                  )
                )
              }%`,
          }}
        />

      </div>

    </div>
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


// =====================================================
// EVIDENCE
// =====================================================

function EvidenceSection({
  allReasons,
  behaviorReasons,
  storedRuleReasons,
}: {
  allReasons: string[];
  behaviorReasons: string[];
  storedRuleReasons?: string[];
}) {

  const {
    ruleReasons,
    mlReasons,
  } =
    useMemo(
      () => {

        const behaviorSet =
          new Set(
            behaviorReasons
          );


        const mlReasons =
          allReasons.filter(
            (
              reason
            ) =>
              reason
                .toLowerCase()
                .includes(
                  "ml model"
                )
          );


        const calculatedRuleReasons =
          allReasons.filter(
            (
              reason
            ) =>
              !behaviorSet.has(
                reason
              ) &&
              !reason
                .toLowerCase()
                .includes(
                  "ml model"
                )
          );


        return {

          ruleReasons:
            storedRuleReasons
              ?.length
              ? storedRuleReasons
              : calculatedRuleReasons,

          mlReasons,

        };

      },
      [
        allReasons,
        behaviorReasons,
        storedRuleReasons,
      ]
    );


  return (

    <section
      className="
        mt-6
        grid
        gap-6
        lg:grid-cols-3
      "
    >

      <EvidenceBox
        title="Rule Evidence"
        items={
          ruleReasons
        }
      />


      <EvidenceBox
        title="Behavior Evidence"
        items={
          behaviorReasons
        }
      />


      <EvidenceBox
        title="ML Evidence"
        items={
          mlReasons
        }
      />

    </section>
  );
}


// =====================================================
// EVIDENCE BOX
// =====================================================

function EvidenceBox({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >

      <h2
        className="
          text-lg
          font-semibold
        "
      >
        {title}
      </h2>


      {items.length > 0 ? (

        <div
          className="
            mt-5
            space-y-3
          "
        >

          {
            items.map(
              (
                item,
                index
              ) => (

              <div
                key={
                  `${item}-${index}`
                }
                className="
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  p-4
                  text-sm
                  leading-6
                  text-slate-300
                "
              >
                {item}
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
          No evidence available.
        </p>

      )}

    </div>
  );
}