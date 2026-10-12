import type {
  Metadata,
} from "next";

import "./globals.css";

import AppShell
  from "@/components/layout/AppShell";


export const metadata: Metadata = {

  title:
    "FraudShield Intelligence",

  description:
    "Explainable AI Fraud Detection and Investigation Platform",
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {

  return (

    <html lang="en">

      <body
        className="
          bg-slate-950
          text-white
          antialiased
        "
      >

        <AppShell>

          {children}

        </AppShell>

      </body>

    </html>
  );
}