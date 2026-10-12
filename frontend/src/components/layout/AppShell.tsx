import type {
  ReactNode,
} from "react";

import Sidebar
  from "./Sidebar";


interface AppShellProps {
  children: ReactNode;
}


export default function AppShell({
  children,
}: AppShellProps) {

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