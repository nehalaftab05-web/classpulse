import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassPulse | FAST-NU CFD Academic Hub & Google Classroom Sync",
  description: "Connect your Google Classroom to generate automated weekly timetables, deadline radars, and phone calendar sync for FAST-NU CFD BCS-5E.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-canvas text-textPrimary antialiased selection:bg-textPrimary selection:text-surface">
        {children}
      </body>
    </html>
  );
}
