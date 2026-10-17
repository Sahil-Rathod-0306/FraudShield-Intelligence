"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  apiRequest,
} from "@/lib/api";

import {
  getAuthToken,
} from "@/lib/auth";


// =====================================================
// RESPONSE TYPE
// =====================================================

interface RegisterResponse {
  success: boolean;

  message: string;

  data: {
    user: {
      id: string;

      name: string;

      email: string;

      role: string;

      status?: string;

      authProvider?: string;

      isEmailVerified: boolean;
    };
  };
}


// =====================================================
// RESEND RESPONSE
// =====================================================

interface ResendVerificationResponse {
  success: boolean;

  message: string;
}


// =====================================================
// REGISTER PAGE
// =====================================================

export default function RegisterPage() {

  const router =
    useRouter();


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    email,
    setEmail,
  ] =
    useState("");


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
    registeredEmail,
    setRegisteredEmail,
  ] =
    useState("");


  const [
    resendLoading,
    setResendLoading,
  ] =
    useState(false);


  const [
    resendMessage,
    setResendMessage,
  ] =
    useState("");


  // =====================================================
  // ALREADY LOGGED IN
  // =====================================================

  useEffect(() => {

    const token =
      getAuthToken();


    if (token) {

      router.replace(
        "/dashboard"
      );
    }

  }, [
    router,
  ]);


  // =====================================================
  // REGISTER
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


        setResendMessage(
          ""
        );


        const normalizedName =
          name.trim();


        const normalizedEmail =
          email
            .trim()
            .toLowerCase();


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
          normalizedName.length <
          2
        ) {

          setError(
            "Please enter your full name."
          );

          return;
        }


        if (
          !normalizedEmail
        ) {

          setError(
            "Email address is required."
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


        // =====================================================
        // REGISTER REQUEST
        // =====================================================

        const response =
          await apiRequest<RegisterResponse>(
            "/auth/register",
            {

              method:
                "POST",

              body:
                JSON.stringify({

                  name:
                    normalizedName,

                  email:
                    normalizedEmail,

                  password,

                }),
            }
          );


        setRegisteredEmail(
          response.data.user.email
        );


        setSuccess(
          true
        );


      } catch (
        error
      ) {

        console.error(
          "Registration error:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Unable to create account."
        );


      } finally {

        setLoading(
          false
        );
      }
    };


  // =====================================================
  // RESEND VERIFICATION
  // =====================================================

  const resendVerification =
    async () => {

      if (
        !registeredEmail ||
        resendLoading
      ) {
        return;
      }


      try {

        setResendLoading(
          true
        );


        setResendMessage(
          ""
        );


        const response =
          await apiRequest<ResendVerificationResponse>(
            "/auth/resend-verification",
            {

              method:
                "POST",

              body:
                JSON.stringify({

                  email:
                    registeredEmail,

                }),
            }
          );


        setResendMessage(
          response.message
        );


      } catch (
        error
      ) {

        console.error(
          "Resend verification error:",
          error
        );


        setResendMessage(
          error instanceof Error
            ? error.message
            : "Unable to resend verification email."
        );


      } finally {

        setResendLoading(
          false
        );
      }
    };


  // =====================================================
  // SUCCESS SCREEN
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
            shadow-2xl
          "
        >

          {/* ICON */}

          <div
            className="
              mx-auto
              flex
              h-16
              w-16
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
              className="h-8 w-8"
              stroke="currentColor"
              strokeWidth="2"
            >

              <path
                d="M4 6h16v12H4z"
              />

              <path
                d="m4 7 8 6 8-6"
              />

            </svg>

          </div>


          <p
            className="
              mt-6
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
            Check your email
          </h1>


          <p
            className="
              mt-4
              text-sm
              leading-6
              text-slate-400
            "
          >
            We sent a verification link to
          </p>


          <p
            className="
              mt-1
              break-all
              font-medium
              text-white
            "
          >
            {registeredEmail}
          </p>


          <div
            className="
              mt-6
              rounded-xl
              border
              border-cyan-900
              bg-cyan-950/20
              p-4
            "
          >

            <p
              className="
                text-sm
                leading-6
                text-cyan-200
              "
            >
              Open the email and click
              <strong>
                {" "}
                Verify Email
              </strong>
              . After verification you can
              sign in to FraudShield.
            </p>

          </div>


          {resendMessage && (

            <div
              className="
                mt-4
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                p-3
                text-sm
                text-slate-300
              "
            >
              {resendMessage}
            </div>

          )}


          <button
            type="button"
            onClick={
              resendVerification
            }
            disabled={
              resendLoading
            }
            className="
              mt-6
              w-full
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
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {
              resendLoading
                ? "Sending..."
                : "Resend Verification Email"
            }

          </button>


          <Link
            href="/login"
            className="
              mt-3
              block
              w-full
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
            Go to Login
          </Link>

        </div>

      </main>
    );
  }


  // =====================================================
  // REGISTER FORM
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
          grid
          w-full
          max-w-5xl
          overflow-hidden
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          shadow-2xl
          lg:grid-cols-2
        "
      >

        {/* =====================================================
            BRAND SIDE
        ===================================================== */}

        <div
          className="
            hidden
            flex-col
            justify-between
            border-r
            border-slate-800
            bg-slate-950
            p-10
            lg:flex
          "
        >

          <div>

            <div
              className="
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
                className="h-8 w-8"
                stroke="currentColor"
                strokeWidth="2.2"
              >

                <path
                  d="
                    M12 3
                    3 7
                    v6
                    c0 5
                    3.8 8.4
                    9 9
                    5.2-.6
                    9-4
                    9-9
                    V7
                    l-9-4Z
                  "
                />

                <path
                  d="m9 12 2 2 4-4"
                />

              </svg>

            </div>


            <p
              className="
                mt-8
                text-xs
                font-semibold
                uppercase
                tracking-[0.3em]
                text-cyan-400
              "
            >
              FraudShield Intelligence
            </p>


            <h1
              className="
                mt-4
                text-4xl
                font-bold
                leading-tight
              "
            >
              Join the fraud
              intelligence platform.
            </h1>


            <p
              className="
                mt-5
                leading-7
                text-slate-400
              "
            >
              Analyze suspicious transactions,
              inspect risk signals and investigate
              potential fraud using AI-assisted tools.
            </p>

          </div>


          <div
            className="
              space-y-3
              text-sm
              text-slate-500
            "
          >

            <p>
              ✓ Secure email verification
            </p>

            <p>
              ✓ Explainable fraud detection
            </p>

            <p>
              ✓ AI-assisted investigations
            </p>

            <p>
              ✓ Role-based access control
            </p>

          </div>

        </div>


        {/* =====================================================
            FORM SIDE
        ===================================================== */}

        <div
          className="
            p-7
            sm:p-10
          "
        >

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-cyan-400
              lg:hidden
            "
          >
            FraudShield Intelligence
          </p>


          <h2
            className="
              mt-4
              text-3xl
              font-bold
            "
          >
            Create account
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-slate-400
            "
          >
            Create your FraudShield account.
            New accounts are assigned the
            ANALYST role by default.
          </p>


          {/* ERROR */}

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
              mt-8
              space-y-5
            "
          >

            {/* NAME */}

            <div>

              <label
                htmlFor="name"
                className="
                  text-sm
                  font-medium
                  text-slate-300
                "
              >
                Full name
              </label>


              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={
                  name
                }
                onChange={
                  (
                    event
                  ) =>
                    setName(
                      event.target.value
                    )
                }
                placeholder="Sahil Rathod"
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
                  transition
                  placeholder:text-slate-600
                  focus:border-cyan-500
                "
              />

            </div>


            {/* EMAIL */}

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
                autoComplete="email"
                required
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
                  transition
                  placeholder:text-slate-600
                  focus:border-cyan-500
                "
              />

            </div>


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
                Password
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
                  autoComplete="new-password"
                  required
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
                    transition
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
                    font-medium
                    text-slate-500
                    hover:text-slate-300
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


            {/* CONFIRM PASSWORD */}

            <div>

              <label
                htmlFor="confirm-password"
                className="
                  text-sm
                  font-medium
                  text-slate-300
                "
              >
                Confirm password
              </label>


              <input
                id="confirm-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                required
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
                placeholder="Enter password again"
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
                  transition
                  placeholder:text-slate-600
                  focus:border-cyan-500
                "
              />

            </div>


            {/* SUBMIT */}

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
                  ? "Creating account..."
                  : "Create Account"
              }

            </button>

          </form>


          {/* GOOGLE */}

          <div
            className="
              my-7
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                h-px
                flex-1
                bg-slate-800
              "
            />

            <span
              className="
                text-xs
                uppercase
                text-slate-600
              "
            >
              or
            </span>

            <div
              className="
                h-px
                flex-1
                bg-slate-800
              "
            />

          </div>


          <button
            type="button"
            disabled
            className="
              flex
              w-full
              cursor-not-allowed
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-5
              py-3
              text-sm
              font-medium
              text-slate-500
              opacity-70
            "
          >

            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                bg-white
                font-bold
                text-slate-950
              "
            >
              G
            </span>

            Continue with Google

            <span
              className="
                text-xs
              "
            >
              (coming next)
            </span>

          </button>


          {/* LOGIN */}

          <p
            className="
              mt-7
              text-center
              text-sm
              text-slate-500
            "
          >

            Already have an account?

            {" "}

            <Link
              href="/login"
              className="
                font-medium
                text-cyan-400
                hover:text-cyan-300
              "
            >
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}