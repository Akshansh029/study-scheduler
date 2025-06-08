import "@/styles/globals.css";
import { Toaster } from "sonner";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "SlotWise",
  description: "Smart Study Scheduler",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`}>
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster richColors theme="light" />
        </body>
      </html>
    </ClerkProvider>
  );
}
