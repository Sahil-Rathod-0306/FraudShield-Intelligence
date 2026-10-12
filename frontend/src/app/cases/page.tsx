"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  apiRequest,
} from "@/lib/api";

import type {
  FraudCase,
  FraudCasesResponse,
} from "@/types/fraudshield";


// =====================================================
// HELPERS
// =====================================================

function getSeverityClass(
  severity: string
) {
  switch (severity) {

    case "CRITICAL":
      return "border-red-900 bg-red-950 text-red-300";

    case "HIGH":
      return "border-orange-900 bg-orange-950 text-orange-300";

    case "MEDIUM":
      return "border-yellow-900 bg-yellow-950 text-yellow-300";

    case "LOW":
      return "border-green-900 bg-green-950 text-green-300";

    default:
      return "border-slate-700 bg-slate-800 text-slate-300";
  }
}


function getStatusClass(
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

export default function FraudCasesPage() {

  const [
    fraudCases,
    setFraudCases,
  ] =
    useState<FraudCase[]>(
      []
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
  // SEARCH
  // =====================================================

  const [
    searchInput,
    setSearchInput,
  ] =
    useState("");


  const [
    search,
    setSearch,
  ] =
    useState("");


  // =====================================================
  // FILTERS
  // =====================================================

  const [
    severity,
    setSeverity,
  ] =
    useState("");


  const [
    status,
    setStatus,
  ] =
    useState("");


  // =====================================================
  // PAGINATION
  // =====================================================

  const [
    page,
    setPage,
  ] =
    useState(1);


  const [
    total,
    setTotal,
  ] =
    useState(0);


  const [
    totalPages,
    setTotalPages,
  ] =
    useState(1);


  const limit =
    10;


  // =====================================================
  // LOAD CASES
  // =====================================================

  useEffect(() => {

    const loadCases =
      async () => {

        try {

          setLoading(true);

          setError("");


          const params =
            new URLSearchParams();


          params.set(
            "page",
            String(page)
          );


          params.set(
            "limit",
            String(limit)
          );


          if (search) {

            params.set(
              "search",
              search
            );
          }


          if (severity) {

            params.set(
              "severity",
              severity
            );
          }


          if (status) {

            params.set(
              "status",
              status
            );
          }


          const response =
            await apiRequest<FraudCasesResponse>(
              `/cases?${params.toString()}`
            );


          const data =
            response.data;


          // =====================================================
          // SUPPORT CURRENT BACKEND FORMAT
          // =====================================================

          if (
            Array.isArray(data)
          ) {

            setFraudCases(
              data
            );

            setTotal(
              data.length
            );

            setTotalPages(
              1
            );

          } else {

            const cases =
              data.fraudCases ??
              data.cases ??
              [];


            setFraudCases(
              cases
            );


            setTotal(
              data.pagination
                ?.total ??
              cases.length
            );


            setTotalPages(
              data.pagination
                ?.totalPages ??
              1
            );
          }


        } catch (error) {

          console.error(
            "Fraud cases loading error:",
            error
          );


          setError(
            error instanceof Error
              ? error.message
              : "Failed to load fraud cases"
          );


          setFraudCases(
            []
          );


        } finally {

          setLoading(false);

        }
      };


    void loadCases();

  }, [
    page,
    search,
    severity,
    status,
  ]);


  // =====================================================
  // APPLY SEARCH
  // =====================================================

  const applySearch =
    () => {

      setPage(1);

      setSearch(
        searchInput.trim()
      );
    };


  // =====================================================
  // RESET
  // =====================================================

  const resetFilters =
    () => {

      setSearchInput("");

      setSearch("");

      setSeverity("");

      setStatus("");

      setPage(1);
    };


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
            HEADER
        ===================================================== */}

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
                tracking-[0.25em]
                text-cyan-400
              "
            >
              FraudShield Intelligence
            </p>


            <h1
              className="
                mt-3
                text-3xl
                font-bold
                md:text-4xl
              "
            >
              Fraud Cases
            </h1>


            <p
              className="
                mt-2
                text-slate-400
              "
            >
              Search, filter and investigate
              suspicious fraud cases.
            </p>

          </div>


          <div
            className="
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              px-6
              py-4
            "
          >

            <p
              className="
                text-xs
                uppercase
                text-slate-500
              "
            >
              Results
            </p>


            <p
              className="
                mt-1
                text-2xl
                font-bold
              "
            >
              {total}
            </p>

          </div>

        </div>


        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section
          className="
            mt-8
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-5
          "
        >

          <div
            className="
              grid
              gap-4
              lg:grid-cols-[2fr_1fr_1fr_auto]
            "
          >

            {/* SEARCH */}

            <div>

              <label
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Search
              </label>


              <input
                type="text"
                value={
                  searchInput
                }
                onChange={
                  (
                    event
                  ) =>
                    setSearchInput(
                      event.target.value
                    )
                }
                onKeyDown={
                  (
                    event
                  ) => {

                    if (
                      event.key ===
                      "Enter"
                    ) {
                      applySearch();
                    }
                  }
                }
                placeholder="Case ID, customer, title..."
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-500
                "
              />

            </div>


            {/* SEVERITY */}

            <div>

              <label
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Severity
              </label>


              <select
                value={
                  severity
                }
                onChange={
                  (
                    event
                  ) => {

                    setSeverity(
                      event.target.value
                    );

                    setPage(1);
                  }
                }
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-cyan-500
                "
              >

                <option value="">
                  All severity
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="CRITICAL">
                  Critical
                </option>

              </select>

            </div>


            {/* STATUS */}

            <div>

              <label
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Status
              </label>


              <select
                value={
                  status
                }
                onChange={
                  (
                    event
                  ) => {

                    setStatus(
                      event.target.value
                    );

                    setPage(1);
                  }
                }
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-cyan-500
                "
              >

                <option value="">
                  All status
                </option>

                <option value="OPEN">
                  Open
                </option>

                <option value="INVESTIGATING">
                  Investigating
                </option>

                <option value="ESCALATED">
                  Escalated
                </option>

                <option value="CONFIRMED_FRAUD">
                  Confirmed Fraud
                </option>

                <option value="FALSE_POSITIVE">
                  False Positive
                </option>

                <option value="CLOSED">
                  Closed
                </option>

              </select>

            </div>


            {/* BUTTONS */}

            <div
              className="
                flex
                items-end
                gap-2
              "
            >

              <button
                type="button"
                onClick={
                  applySearch
                }
                className="
                  rounded-xl
                  bg-cyan-400
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-slate-950
                  transition
                  hover:bg-cyan-300
                "
              >
                Apply
              </button>


              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-slate-300
                  transition
                  hover:bg-slate-800
                "
              >
                Reset
              </button>

            </div>

          </div>

        </section>


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
            CASE TABLE
        ===================================================== */}

        <section
          className="
            mt-6
            overflow-hidden
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
          "
        >

          {loading ? (

            <div className="p-10">

              <p className="text-slate-400">
                Loading fraud cases...
              </p>

            </div>

          ) : fraudCases.length ===
            0 ? (

            <div
              className="
                p-12
                text-center
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                No fraud cases found
              </h2>


              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                "
              >
                Try changing your search
                or filters.
              </p>

            </div>

          ) : (

            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  text-left
                "
              >

                <thead
                  className="
                    border-b
                    border-slate-800
                  "
                >

                  <tr
                    className="
                      text-xs
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >

                    <th className="px-5 py-4">
                      Case
                    </th>

                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Risk
                    </th>

                    <th className="px-5 py-4">
                      Severity
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Created
                    </th>

                    <th className="px-5 py-4">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody
                  className="
                    divide-y
                    divide-slate-800
                  "
                >

                  {fraudCases.map(
                    (
                      fraudCase
                    ) => (

                    <tr
                      key={
                        fraudCase._id
                      }
                      className="
                        transition
                        hover:bg-slate-800/40
                      "
                    >

                      {/* CASE */}

                      <td
                        className="
                          px-5
                          py-5
                        "
                      >

                        <p
                          className="
                            font-medium
                            text-cyan-400
                          "
                        >
                          {
                            fraudCase.caseId
                          }
                        </p>


                        {fraudCase.title && (

                          <p
                            className="
                              mt-1
                              max-w-xs
                              truncate
                              text-xs
                              text-slate-500
                            "
                          >
                            {
                              fraudCase.title
                            }
                          </p>

                        )}

                      </td>


                      {/* CUSTOMER */}

                      <td
                        className="
                          px-5
                          py-5
                          text-slate-300
                        "
                      >
                        {
                          fraudCase.customerId
                        }
                      </td>


                      {/* RISK */}

                      <td
                        className="
                          px-5
                          py-5
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <span
                            className="
                              text-lg
                              font-bold
                            "
                          >
                            {
                              fraudCase.riskScore
                            }
                          </span>


                          <div
                            className="
                              h-2
                              w-20
                              overflow-hidden
                              rounded-full
                              bg-slate-800
                            "
                          >

                            <div
                              className="
                                h-full
                                rounded-full
                                bg-cyan-400
                              "
                              style={{
                                width:
                                  `${
                                    Math.min(
                                      Math.max(
                                        fraudCase.riskScore,
                                        0
                                      ),
                                      100
                                    )
                                  }%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>


                      {/* SEVERITY */}

                      <td
                        className="
                          px-5
                          py-5
                        "
                      >

                        <span
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1
                            text-xs
                            font-semibold

                            ${
                              getSeverityClass(
                                fraudCase.severity
                              )
                            }
                          `}
                        >
                          {
                            fraudCase.severity
                          }
                        </span>

                      </td>


                      {/* STATUS */}

                      <td
                        className="
                          px-5
                          py-5
                        "
                      >

                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold

                            ${
                              getStatusClass(
                                fraudCase.status
                              )
                            }
                          `}
                        >
                          {
                            fraudCase.status
                          }
                        </span>

                      </td>


                      {/* CREATED */}

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-5
                          text-sm
                          text-slate-500
                        "
                      >
                        {
                          safeDate(
                            fraudCase.createdAt
                          )
                        }
                      </td>


                      {/* ACTION */}

                      <td
                        className="
                          px-5
                          py-5
                        "
                      >

                        <Link
                          href={
                            `/cases/${
                              fraudCase.caseId
                            }`
                          }
                          className="
                            whitespace-nowrap
                            rounded-lg
                            bg-cyan-400
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-slate-950
                            transition
                            hover:bg-cyan-300
                          "
                        >
                          Open Case
                        </Link>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {!loading &&
          total > 0 && (

          <div
            className="
              mt-6
              flex
              flex-col
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              px-5
              py-4
              sm:flex-row
            "
          >

            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Page
              {" "}
              <span className="text-white">
                {page}
              </span>
              {" "}
              of
              {" "}
              <span className="text-white">
                {totalPages}
              </span>
              {" • "}
              {total}
              {" "}
              cases
            </p>


            <div
              className="
                flex
                gap-2
              "
            >

              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={
                  () =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          current - 1,
                          1
                        )
                    )
                }
                className="
                  rounded-lg
                  border
                  border-slate-700
                  px-4
                  py-2
                  text-sm
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                ← Previous
              </button>


              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={
                  () =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.min(
                          current + 1,
                          totalPages
                        )
                    )
                }
                className="
                  rounded-lg
                  border
                  border-slate-700
                  px-4
                  py-2
                  text-sm
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next →
              </button>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}