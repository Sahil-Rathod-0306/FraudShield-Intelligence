"use client";

import Link
  from "next/link";

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
  saveAuthToken,
} from "@/lib/auth";

import type {
  LoginResponse,
} from "@/types/fraudshield";


// =====================================================
// LOGIN PAGE
// =====================================================

export default function LoginPage() {

  const router =
    useRouter();


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

  }, [router]);


  // =====================================================
  // LOGIN
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


        const normalizedEmail =
          email
            .trim()
            .toLowerCase();


        if (
          !normalizedEmail ||
          !password
        ) {

          setError(
            "Email and password are required."
          );

          return;
        }


        const response =
          await apiRequest<LoginResponse>(
            "/auth/login",
            {
              method:
                "POST",

              body:
                JSON.stringify({
                  email:
                    normalizedEmail,

                  password,
                }),
            }
          );


        saveAuthToken(
          response.data.token
        );


        router.replace(
          "/dashboard"
        );


        router.refresh();


      } catch (
        error
      ) {

        console.error(
          "Login error:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Unable to sign in."
        );


      } finally {

        setLoading(
          false
        );

      }
    };


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
            LEFT BRAND SECTION
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
              AI-powered fraud
              detection and
              investigation.
            </h1>


            <p
              className="
                mt-5
                max-w-md
                leading-7
                text-slate-400
              "
            >
              Monitor transactions,
              investigate suspicious activity,
              review explainable ML signals and
              generate AI-assisted fraud reports.
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
              ✓ Rule-based risk detection
            </p>

            <p>
              ✓ Behavioral fraud analysis
            </p>

            <p>
              ✓ Explainable ML with SHAP
            </p>

            <p>
              ✓ AI investigation with Ollama
            </p>

          </div>

        </div>


        {/* =====================================================
            LOGIN FORM
        ===================================================== */}

        <div
          className="
            p-7
            sm:p-10
          "
        >

          <div
            className="
              lg:hidden
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

          </div>


          <h2
            className="
              mt-4
              text-3xl
              font-bold
            "
          >
            Welcome back
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-slate-400
            "
          >
            Sign in to access the
            FraudShield investigation platform.
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
                placeholder="analyst@fraudshield.com"
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

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

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


                <Link
                  href="/forgot-password"
                  className="
                    text-xs
                    text-cyan-400
                    hover:text-cyan-300
                  "
                >
                  Forgot password?
                </Link>

              </div>


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
                  autoComplete="current-password"
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
                  placeholder="Enter your password"
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
                  onClick={() =>
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


            {/* LOGIN BUTTON */}

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
                  ? "Signing in..."
                  : "Sign In"
              }

            </button>

          </form>


          {/* GOOGLE PLACEHOLDER */}

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
            <span className="text-xs">
              (coming next)
            </span>

          </button>


          <p
            className="
              mt-7
              text-center
              text-sm
              text-slate-500
            "
          >
            Need an account?
            {" "}

            <Link
              href="/register"
              className="
                font-medium
                text-cyan-400
                hover:text-cyan-300
              "
            >
              Register
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}