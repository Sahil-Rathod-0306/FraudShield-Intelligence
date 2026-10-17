"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  apiRequest,
} from "@/lib/api";

import {
  removeAuthToken,
} from "@/lib/auth";

import type {
  AuthUser,
  CurrentUserResponse,
} from "@/types/fraudshield";


// =====================================================
// NAVIGATION TYPE
// =====================================================

interface NavigationItem {
  name: string;
  href: string;
  icon: ReactNode;
}


// =====================================================
// NAVIGATION ITEMS
// =====================================================

const navigation: NavigationItem[] = [

  {
    name: "Dashboard",

    href: "/dashboard",

    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
      </svg>
    ),
  },


  {
    name: "Transactions",

    href: "/transactions",

    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M7 7h14" />

        <path d="m17 3 4 4-4 4" />

        <path d="M17 17H3" />

        <path d="m7 13-4 4 4 4" />
      </svg>
    ),
  },


  {
    name: "Fraud Cases",

    href: "/cases",

    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 3 3 7v6c0 5 3.8 8.4 9 9 5.2-.6 9-4 9-9V7l-9-4Z"
        />

        <path d="M12 8v4" />

        <path d="M12 16h.01" />
      </svg>
    ),
  },
];


// =====================================================
// ACTIVE ROUTE
// =====================================================

function isActiveRoute(
  pathname: string,
  href: string
) {

  if (
    href === "/dashboard"
  ) {

    return (
      pathname === "/dashboard"
    );
  }


  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}


// =====================================================
// SIDEBAR
// =====================================================

export default function Sidebar() {

  // =====================================================
  // HOOKS
  // =====================================================

  const pathname =
    usePathname();


  const router =
    useRouter();


  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);


  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      null
    );


  const [
    userLoading,
    setUserLoading,
  ] =
    useState(true);


  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {

    let cancelled =
      false;


    const loadUser =
      async () => {

        try {

          setUserLoading(
            true
          );


          const response =
            await apiRequest<CurrentUserResponse>(
              "/auth/me"
            );


          if (
            cancelled
          ) {
            return;
          }


          setUser(
            response.data.user
          );


        } catch (error) {

          console.error(
            "Unable to load current user:",
            error
          );


          if (
            !cancelled
          ) {

            setUser(
              null
            );
          }


        } finally {

          if (
            !cancelled
          ) {

            setUserLoading(
              false
            );
          }

        }
      };


    void loadUser();


    return () => {

      cancelled =
        true;

    };

  }, []);


  // =====================================================
  // CLOSE MOBILE MENU WHEN ROUTE CHANGES
  // =====================================================

  useEffect(() => {

    setMobileOpen(
      false
    );

  }, [
    pathname,
  ]);


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout =
    () => {

      removeAuthToken();


      setUser(
        null
      );


      setMobileOpen(
        false
      );


      router.replace(
        "/login"
      );


      router.refresh();
    };


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-40
          flex
          h-16
          items-center
          justify-between
          border-b
          border-slate-800
          bg-slate-950/95
          px-5
          backdrop-blur
          md:hidden
        "
      >

        <Link
          href="/dashboard"
          className="
            flex
            items-center
            gap-3
          "
        >

          <Logo />


          <div>

            <p
              className="
                text-sm
                font-bold
                text-white
              "
            >
              FraudShield
            </p>


            <p
              className="
                text-[10px]
                uppercase
                tracking-widest
                text-cyan-400
              "
            >
              Intelligence
            </p>

          </div>

        </Link>


        <button
          type="button"
          onClick={
            () =>
              setMobileOpen(
                (
                  current
                ) =>
                  !current
              )
          }
          className="
            rounded-lg
            border
            border-slate-800
            bg-slate-900
            p-2
            text-slate-300
          "
          aria-label="Toggle navigation"
        >

          {mobileOpen ? (

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 12 12" />

              <path d="m18 6-12 12" />
            </svg>

          ) : (

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16" />

              <path d="M4 12h16" />

              <path d="M4 18h16" />
            </svg>

          )}

        </button>

      </header>


      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileOpen && (

        <div
          className="
            fixed
            inset-0
            z-30
            bg-slate-950/80
            pt-16
            backdrop-blur-sm
            md:hidden
          "
        >

          <div
            className="
              border-b
              border-slate-800
              bg-slate-950
              p-4
            "
          >

            <NavigationLinks
              pathname={
                pathname
              }
              onNavigate={
                () =>
                  setMobileOpen(
                    false
                  )
              }
            />


            {/* USER INFO */}

            <div
              className="
                mt-5
                border-t
                border-slate-800
                pt-5
              "
            >

              <UserPanel
                user={
                  user
                }
                loading={
                  userLoading
                }
                onLogout={
                  logout
                }
              />

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          bottom-0
          left-0
          top-0
          z-40
          hidden
          w-64
          flex-col
          border-r
          border-slate-800
          bg-slate-950
          md:flex
        "
      >

        {/* =====================================================
            LOGO
        ===================================================== */}

        <div
          className="
            flex
            h-20
            items-center
            border-b
            border-slate-800
            px-6
          "
        >

          <Link
            href="/dashboard"
            className="
              flex
              items-center
              gap-3
            "
          >

            <Logo />


            <div>

              <p
                className="
                  font-bold
                  text-white
                "
              >
                FraudShield
              </p>


              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-cyan-400
                "
              >
                Intelligence
              </p>

            </div>

          </Link>

        </div>


        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            py-6
          "
        >

          <p
            className="
              mb-3
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-slate-600
            "
          >
            Navigation
          </p>


          <NavigationLinks
            pathname={
              pathname
            }
          />

        </div>


        {/* =====================================================
            USER / LOGOUT
        ===================================================== */}

        <div
          className="
            border-t
            border-slate-800
            p-4
          "
        >

          <UserPanel
            user={
              user
            }
            loading={
              userLoading
            }
            onLogout={
              logout
            }
          />

        </div>

      </aside>

    </>
  );
}


// =====================================================
// USER PANEL
// =====================================================

function UserPanel({
  user,
  loading,
  onLogout,
}: {
  user:
    AuthUser | null;

  loading:
    boolean;

  onLogout:
    () => void;
}) {

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        className="
          rounded-xl
          border
          border-slate-800
          bg-slate-900/60
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              h-10
              w-10
              animate-pulse
              rounded-full
              bg-slate-800
            "
          />


          <div
            className="
              flex-1
            "
          >

            <div
              className="
                h-3
                w-24
                animate-pulse
                rounded
                bg-slate-800
              "
            />


            <div
              className="
                mt-2
                h-2
                w-16
                animate-pulse
                rounded
                bg-slate-800
              "
            />

          </div>

        </div>

      </div>

    );
  }


  // =====================================================
  // USER NOT AVAILABLE
  // =====================================================

  if (!user) {

    return (

      <div
        className="
          rounded-xl
          border
          border-slate-800
          bg-slate-900/60
          p-4
        "
      >

        <p
          className="
            text-xs
            text-slate-500
          "
        >
          User information unavailable.
        </p>


        <button
          type="button"
          onClick={
            onLogout
          }
          className="
            mt-3
            w-full
            rounded-lg
            border
            border-slate-700
            bg-slate-950
            px-3
            py-2
            text-xs
            font-medium
            text-slate-300
            transition
            hover:bg-slate-800
          "
        >
          Return to Login
        </button>

      </div>

    );
  }


  // =====================================================
  // USER
  // =====================================================

  return (

    <div
      className="
        rounded-xl
        border
        border-slate-800
        bg-slate-900/60
        p-4
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {/* AVATAR */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-cyan-400
            font-bold
            text-slate-950
          "
        >

          {
            user.name
              .charAt(0)
              .toUpperCase()
          }

        </div>


        {/* NAME + ROLE */}

        <div
          className="
            min-w-0
            flex-1
          "
        >

          <p
            className="
              truncate
              text-sm
              font-semibold
              text-white
            "
          >
            {user.name}
          </p>


          <p
            className="
              mt-0.5
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-cyan-400
            "
          >
            {user.role}
          </p>

        </div>

      </div>


      {/* EMAIL */}

      <p
        className="
          mt-3
          truncate
          text-xs
          text-slate-500
        "
      >
        {user.email}
      </p>


      {/* LOGOUT */}

      <button
        type="button"
        onClick={
          onLogout
        }
        className="
          mt-4
          w-full
          rounded-lg
          border
          border-slate-700
          bg-slate-950
          px-3
          py-2
          text-xs
          font-medium
          text-slate-300
          transition
          hover:border-red-900
          hover:bg-red-950/30
          hover:text-red-300
        "
      >
        Logout
      </button>

    </div>
  );
}


// =====================================================
// NAVIGATION LINKS
// =====================================================

function NavigationLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;

  onNavigate?: () => void;
}) {

  return (

    <div
      className="
        space-y-2
      "
    >

      {
        navigation.map(
          (
            item
          ) => {

            const active =
              isActiveRoute(
                pathname,
                item.href
              );


            return (

              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                onClick={
                  onNavigate
                }
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition

                  ${
                    active
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }
                `}
              >

                {item.icon}


                <span>
                  {item.name}
                </span>

              </Link>

            );
          }
        )
      }

    </div>
  );
}


// =====================================================
// LOGO
// =====================================================

function Logo() {

  return (

    <div
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        bg-cyan-400
        text-slate-950
      "
    >

      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
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
  );
}