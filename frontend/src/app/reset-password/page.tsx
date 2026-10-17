"use client";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  apiRequest,
} from "@/lib/api";


interface ResetPasswordResponse {

  success:
    boolean;

  message:
    string;
}


// =====================================================
// PAGE
// =====================================================

export default function ResetPasswordPage() {

  const searchParams =
    useSearchParams();


  const token =
    searchParams.get(
      "token"
    );


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


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
    success,
    setSuccess,
  ] =
    useState(false);


  const [
    message,
    setMessage,
  ] =
    useState("");


  // =====================================================
  // RESET PASSWORD
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

        setError(
          ""
        );


        setMessage(
          ""
        );


        if (
          !token
        ) {

          setError(
            "Password reset token is missing."
          );

          return;
        }


        if (
          password.length <
          8
        ) {

          setError(
            "Password must contain at least 8 characters."
          );

          return;
        }


        if (
          password !==
          confirmPassword
        ) {

          setError(
            "Passwords do not match."
          );

          return;
        }


        setLoading(
          true
        );


        const response =
          await apiRequest<ResetPasswordResponse>(
            "/auth/reset-password",
            {

              method:
                "POST",

              body:
                JSON.stringify({

                  token,

                  password,

                }),
            }
          );


        setSuccess(
          true
        );


        setMessage(
          response.message
        );


      } catch (
        error
      ) {

        console.error(
          "Reset password error:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Unable to reset password."
        );


      } finally {

        setLoading(
          false
        );
      }
    };


  // =====================================================
  // SUCCESS
  // =====================================================

  if (
    success
  ) {

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
            text-center
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
              bg-green-400
              text-slate-950
            "
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              stroke="currentColor"
              strokeWidth="2.5"
            >

              <path
                d="m5 12 4 4L19 6"
              />

            </svg>

          </div>


          <h1
            className="
              mt-6
              text-2xl
              font-bold
            "
          >
            Password Updated
          </h1>


          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-400
            "
          >
            {message}
          </p>


          <Link
            href="/login"
            className="
              mt-7
              block
              w-full
              rounded-xl
              bg-cyan-400
              px-5
              py-3
              font-semibold
              text-slate-950
              hover:bg-cyan-300
            "
          >
            Continue to Login
          </Link>

        </div>

      </main>
    );
  }


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
            Set New Password
          </h1>


          <p
            className="
              mt-3
              text-sm
              text-slate-400
            "
          >
            Create a new password for your
            FraudShield account.
          </p>

        </div>


        {!token && (

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
            Password reset token is missing.
            Request a new password reset link.
          </div>

        )}


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


        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-7
            space-y-5
          "
        >

          {/* PASSWORD */}

          <div>

            <label
              htmlFor="password"
              className="
                text-sm
                font-medium
                text-slate-300
              "
            >
              New password
            </label>


            <div
              className="
                relative
                mt-2
              "
            >

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                minLength={8}
                value={
                  password
                }
                onChange={
                  (
                    event
                  ) =>
                    setPassword(
                      event.target.value
                    )
                }
                placeholder="Minimum 8 characters"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  pr-20
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-500
                "
              />


              <button
                type="button"
                onClick={
                  () =>
                    setShowPassword(
                      (
                        current
                      ) =>
                        !current
                    )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  text-slate-500
                "
              >
                {
                  showPassword
                    ? "Hide"
                    : "Show"
                }
              </button>

            </div>

          </div>


          {/* CONFIRM */}

          <div>

            <label
              htmlFor="confirm-password"
              className="
                text-sm
                font-medium
                text-slate-300
              "
            >
              Confirm new password
            </label>


            <input
              id="confirm-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              minLength={8}
              value={
                confirmPassword
              }
              onChange={
                (
                  event
                ) =>
                  setConfirmPassword(
                    event.target.value
                  )
              }
              placeholder="Enter new password again"
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
              loading ||
              !token
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
                ? "Updating Password..."
                : "Reset Password"
            }

          </button>

        </form>


        <Link
          href="/forgot-password"
          className="
            mt-5
            block
            text-center
            text-sm
            text-cyan-400
          "
        >
          Request another reset link
        </Link>

      </div>

    </main>
  );
}