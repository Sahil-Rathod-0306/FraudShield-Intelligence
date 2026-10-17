"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  apiRequest,
} from "@/lib/api";


// =====================================================
// RESPONSE TYPE
// =====================================================

interface VerifyEmailResponse {
  success: boolean;

  message: string;
}


// =====================================================
// PAGE
// =====================================================

export default function VerifyEmailPage() {

  const searchParams =
    useSearchParams();


  const token =
    searchParams.get(
      "token"
    );


  const [
    status,
    setStatus,
  ] =
    useState<
      "VERIFYING" |
      "SUCCESS" |
      "ERROR"
    >(
      "VERIFYING"
    );


  const [
    message,
    setMessage,
  ] =
    useState(
      "Verifying your email..."
    );


  // =====================================================
  // VERIFY EMAIL
  // =====================================================

  useEffect(() => {

    if (!token) {

      setStatus(
        "ERROR"
      );

      setMessage(
        "Verification token is missing."
      );

      return;
    }


    const verify =
      async () => {

        try {

          setStatus(
            "VERIFYING"
          );

          setMessage(
            "Verifying your email..."
          );


          const response =
            await apiRequest<VerifyEmailResponse>(
              "/auth/verify-email",
              {
                method:
                  "POST",

                body:
                  JSON.stringify({
                    token,
                  }),
              }
            );


          setStatus(
            "SUCCESS"
          );


          setMessage(
            response.message ||
            "Email verified successfully."
          );


        } catch (error) {

          console.error(
            "Email verification error:",
            error
          );


          setStatus(
            "ERROR"
          );


          setMessage(
            error instanceof Error
              ? error.message
              : "Email verification failed."
          );

        }
      };


    void verify();

  }, [token]);


  // =====================================================
  // UI
  // =====================================================

  return (

    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-950
        px-5
        py-12
        text-white
      "
    >

      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-8
          shadow-2xl
        "
      >

        {/* LOGO */}

        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-cyan-400
            text-slate-950
          "
        >

          {status ===
            "SUCCESS" ? (

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="m5 12 4 4L19 6"
              />
            </svg>

          ) : status ===
            "ERROR" ? (

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M6 6l12 12"
              />

              <path
                d="M18 6 6 18"
              />
            </svg>

          ) : (

            <div
              className="
                h-7
                w-7
                animate-spin
                rounded-full
                border-2
                border-slate-950
                border-t-transparent
              "
            />

          )}

        </div>


        {/* TITLE */}

        <div
          className="
            mt-6
            text-center
          "
        >

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
              text-2xl
              font-bold
            "
          >

            {status ===
              "VERIFYING"
              ? "Verifying Email"
              : status ===
                "SUCCESS"
                ? "Email Verified"
                : "Verification Failed"}

          </h1>


          <p
            className="
              mt-4
              text-sm
              leading-6
              text-slate-400
            "
          >
            {message}
          </p>

        </div>


        {/* VERIFYING */}

        {status ===
          "VERIFYING" && (

          <div
            className="
              mt-6
              rounded-xl
              border
              border-cyan-900
              bg-cyan-950/20
              p-4
              text-center
            "
          >

            <p
              className="
                text-sm
                text-cyan-300
              "
            >
              Please wait while FraudShield
              verifies your email address.
            </p>

          </div>

        )}


        {/* SUCCESS */}

        {status ===
          "SUCCESS" && (

          <div
            className="
              mt-6
              rounded-xl
              border
              border-green-900
              bg-green-950/20
              p-4
              text-center
            "
          >

            <p
              className="
                text-sm
                font-medium
                text-green-300
              "
            >
              Your account is now verified.
            </p>


            <p
              className="
                mt-2
                text-xs
                text-slate-500
              "
            >
              You can now sign in using
              your email and password.
            </p>

          </div>

        )}


        {/* ERROR */}

        {status ===
          "ERROR" && (

          <div
            className="
              mt-6
              rounded-xl
              border
              border-red-900
              bg-red-950/20
              p-4
            "
          >

            <p
              className="
                text-sm
                text-red-300
              "
            >
              The verification link may
              be invalid or expired.
            </p>

          </div>

        )}


        {/* ACTION */}

        <div
          className="
            mt-7
          "
        >

          {status ===
            "SUCCESS" ? (

            <Link
              href="/login"
              className="
                block
                w-full
                rounded-xl
                bg-cyan-400
                px-5
                py-3
                text-center
                font-semibold
                text-slate-950
                transition
                hover:bg-cyan-300
              "
            >
              Continue to Login
            </Link>

          ) : status ===
            "ERROR" ? (

            <Link
              href="/"
              className="
                block
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-5
                py-3
                text-center
                font-semibold
                text-slate-300
                transition
                hover:bg-slate-800
              "
            >
              Back to FraudShield
            </Link>

          ) : null}

        </div>

      </div>

    </main>
  );
}