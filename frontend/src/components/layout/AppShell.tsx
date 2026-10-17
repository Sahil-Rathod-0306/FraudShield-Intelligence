"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import Sidebar
  from "./Sidebar";

import {
  getAuthToken,
} from "@/lib/auth";


interface AppShellProps {

  children:
    ReactNode;

}


// =====================================================
// PUBLIC ROUTES
// =====================================================

const publicRoutes = [

  "/login",

  "/register",

  "/verify-email",

  "/forgot-password",

  "/reset-password",

];


// =====================================================
// APP SHELL
// =====================================================

export default function AppShell({
  children,
}: AppShellProps) {

  const pathname =
    usePathname();


  const router =
    useRouter();


  const [
    checkingAuth,
    setCheckingAuth,
  ] =
    useState(true);


  const isPublicRoute =
    publicRoutes.some(
      (
        route
      ) =>
        pathname ===
          route ||
        pathname.startsWith(
          `${route}/`
        )
    );


  useEffect(() => {

    // Public pages don't require JWT.

    if (
      isPublicRoute
    ) {

      setCheckingAuth(
        false
      );

      return;
    }


    const token =
      getAuthToken();


    if (!token) {

      router.replace(
        "/login"
      );

      return;
    }


    setCheckingAuth(
      false
    );

  }, [
    isPublicRoute,
    pathname,
    router,
  ]);


  // =====================================================
  // PUBLIC AUTH PAGE
  // =====================================================

  if (
    isPublicRoute
  ) {

    return (
      <>
        {children}
      </>
    );
  }


  // =====================================================
  // AUTH CHECK
  // =====================================================

  if (
    checkingAuth
  ) {

    return (

      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-950
          text-white
        "
      >

        <div
          className="
            text-center
          "
        >

          <div
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-cyan-400
              border-t-transparent
            "
          />


          <p
            className="
              mt-4
              text-sm
              text-slate-500
            "
          >
            Checking authentication...
          </p>

        </div>

      </main>
    );
  }


  // =====================================================
  // AUTHENTICATED APPLICATION
  // =====================================================

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
      "
    >

      <Sidebar />


      <div
        className="
          min-h-screen
          pt-16
          md:pl-64
          md:pt-0
        "
      >

        {children}

      </div>

    </div>
  );
}