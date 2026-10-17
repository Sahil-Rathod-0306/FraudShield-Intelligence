"use client";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import {
  apiRequest,
} from "@/lib/api";


interface ForgotPasswordResponse {

  success:
    boolean;

  message:
    string;
}


// =====================================================
// PAGE
// =====================================================

export default function ForgotPasswordPage() {

  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      if (
        loading
      ) {
        return;
      }


      try {

        setLoading(
          true
        );


        setError(
          ""
        );


        setSuccessMessage(
          ""
        );


        const normalizedEmail =
          email
            .trim()
            .toLowerCase();


        if (
          !normalizedEmail
        ) {

          setError(
            "Email is required."
          );

          return;
        }


        const response =
          await apiRequest<ForgotPasswordResponse>(
            "/auth/forgot-password",
            {

              method:
                "POST",

              body:
                JSON.stringify({

                  email:
                    normalizedEmail,

                }),
            }
          );


        setSuccessMessage(
          response.message
        );


      } catch (
        error
      ) {

        console.error(
          "Forgot password error:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Unable to send reset email."
        );


      } finally {

        setLoading(
          false
        );
      }
    };


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
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          p-8
          shadow-2xl
        "
      >

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

          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7"
            stroke="currentColor"
            strokeWidth="2"
          >

            <rect
              x="3"
              y="11"
              width="18"
              height="10"
              rx="2"
            />

            <path
              d="M7 11V7a5 5 0 0 1 10 0v4"
            />

          </svg>

        </div>


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
            Forgot Password
          </h1>


          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-400
            "
          >
            Enter your registered email address
            and we'll send you a secure password
            reset link.
          </p>

        </div>


        {error && (

          <div
            className="
              mt-6
              rounded-xl
              border
              border-red-900
              bg-red-950/30
              p-4
              text-sm
              text-red-300
            "
          >
            {error}
          </div>

        )}


        {successMessage && (

          <div
            className="
              mt-6
              rounded-xl
              border
              border-green-900
              bg-green-950/30
              p-4
              text-sm
              leading-6
              text-green-300
            "
          >
            {successMessage}
          </div>

        )}


        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-7
            space-y-5
          "
        >

          <div>

            <label
              htmlFor="email"
              className="
                text-sm
                font-medium
                text-slate-300
              "
            >
              Email address
            </label>


            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={
                email
              }
              onChange={
                (
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
              }
              placeholder="you@example.com"
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-slate-600
                focus:border-cyan-500
              "
            />

          </div>


          <button
            type="submit"
            disabled={
              loading
            }
            className="
              w-full
              rounded-xl
              bg-cyan-400
              px-5
              py-3.5
              font-semibold
              text-slate-950
              transition
              hover:bg-cyan-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {
              loading
                ? "Sending..."
                : "Send Reset Link"
            }

          </button>

        </form>


        <Link
          href="/login"
          className="
            mt-5
            block
            text-center
            text-sm
            text-cyan-400
            hover:text-cyan-300
          "
        >
          ← Back to Login
        </Link>

      </div>

    </main>
  );
}