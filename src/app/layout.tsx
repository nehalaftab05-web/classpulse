import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassPulse | Google Classroom Timetable & Academic Planner",
  description: "Connect your Google Classroom to generate automated weekly timetables, deadline radars, and phone calendar sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
