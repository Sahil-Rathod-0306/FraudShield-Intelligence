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
  Transaction,
  TransactionsResponse,
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


function getStatusStyle(
  status: string
) {

  switch (status) {

    case "FLAGGED":
      return "bg-red-950 text-red-300 border-red-900";

    case "DECLINED":
      return "bg-orange-950 text-orange-300 border-orange-900";

    case "APPROVED":
      return "bg-green-950 text-green-300 border-green-900";

    case "PENDING":
      return "bg-yellow-950 text-yellow-300 border-yellow-900";

    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}


// =====================================================
// PAGE
// =====================================================

export default function TransactionsPage() {

  const [
    transactions,
    setTransactions,
  ] =
    useState<Transaction[]>([]);


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
    total,
    setTotal,
  ] =
    useState(0);


  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {

    const loadTransactions =
      async () => {

        try {

          setLoading(true);
          setError("");


          const response =
            await apiRequest<TransactionsResponse>(
              "/transactions"
            );


          setTransactions(
            response.data.transactions
          );


          setTotal(
            response.data.pagination.total
          );


        } catch (error) {

          console.error(
            "Transactions loading error:",
            error
          );


          setError(
            error instanceof Error
              ? error.message
              : "Failed to load transactions"
          );


        } finally {

          setLoading(false);

        }
      };


    void loadTransactions();

  }, []);


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
              Transactions
            </h1>


            <p
              className="
                mt-2
                text-slate-400
              "
            >
              Monitor and review analyzed
              financial transactions.
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
              Total Transactions
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
            LOADING
        ===================================================== */}

        {loading && (

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-10
            "
          >

            <p className="text-slate-400">
              Loading transactions...
            </p>

          </div>

        )}


        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          transactions.length ===
            0 && (

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
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
              No transactions found
            </h2>


            <p
              className="
                mt-2
                text-slate-500
              "
            >
              Submit a transaction through
              FraudShield first.
            </p>

          </div>

        )}


        {/* =====================================================
            TABLE
        ===================================================== */}

        {!loading &&
          transactions.length >
            0 && (

          <div
            className="
              mt-8
              overflow-hidden
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
            "
          >

            <div className="overflow-x-auto">

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
                    bg-slate-900
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
                      Transaction
                    </th>

                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Amount
                    </th>

                    <th className="px-5 py-4">
                      Type
                    </th>

                    <th className="px-5 py-4">
                      Merchant
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Date
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

                  {
                    transactions.map(
                      (
                        transaction
                      ) => (

                      <tr
                        key={
                          transaction._id
                        }
                        className="
                          transition
                          hover:bg-slate-800/50
                        "
                      >

                        <td
                          className="
                            px-5
                            py-5
                            font-medium
                            text-cyan-400
                          "
                        >
                          {
                            transaction.transactionId
                          }
                        </td>


                        <td
                          className="
                            px-5
                            py-5
                            text-slate-300
                          "
                        >
                          {
                            transaction.customerId
                          }
                        </td>


                        <td
                          className="
                            whitespace-nowrap
                            px-5
                            py-5
                            font-semibold
                          "
                        >
                          {
                            formatCurrency(
                              transaction.amount,
                              transaction.currency
                            )
                          }
                        </td>


                        <td
                          className="
                            px-5
                            py-5
                            text-slate-300
                          "
                        >
                          {
                            transaction.transactionType
                          }
                        </td>


                        <td
                          className="
                            px-5
                            py-5
                            text-slate-400
                          "
                        >
                          {
                            transaction.merchant ??
                            "-"
                          }
                        </td>


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
                                getStatusStyle(
                                  transaction.status
                                )
                              }
                            `}
                          >
                            {
                              transaction.status
                            }
                          </span>

                        </td>


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
                            new Date(
                              transaction.transactionTime
                            )
                              .toLocaleString()
                          }
                        </td>


                        <td
                          className="
                            px-5
                            py-5
                          "
                        >

                          <Link
                            href={
                              `/transactions/${
                                transaction.transactionId
                              }`
                            }
                            className="
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
                            View
                          </Link>

                        </td>

                      </tr>

                    ))
                  }

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}