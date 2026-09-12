"use client";

import React from "react";
import { 
  Calendar, 
  Download, 
  Sun, 
  Moon,
  ArrowUpRight,
  School,
  Check
} from "lucide-react";
import { UserProfile } from "../types/classroom";

interface NavbarProps {
  user: UserProfile;
  isDemoMode: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleDemoMode: () => void;
  onOpenGoogleModal: () => void;
  onExportIcs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isDemoMode,
  isDark,
  onToggleTheme,
  onToggleDemoMode,
  onOpenGoogleModal,
  onExportIcs,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-borderSubtle bg-surface/95 backdrop-blur-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-textPrimary text-surface flex items-center justify-center font-bold text-sm shadow-subtle">
            CP
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-textPrimary">
              ClassPulse
            </span>
            <span className="text-xs text-textSecondary font-normal hidden sm:inline">
              / Academic Planner
            </span>
          </div>
        </div>

        {/* Center: Segmented Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-subtle border border-borderSubtle text-xs">
          <button
            onClick={() => { if (!isDemoMode) onToggleDemoMode(); }}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              isDemoMode
                ? "bg-surface text-textPrimary shadow-subtle"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Demo Coursework
          </button>
          <button
            onClick={onOpenGoogleModal}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              !isDemoMode
                ? "bg-surface text-textPrimary shadow-subtle"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Live Google Sync
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Light/Dark Mode Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-subtle border border-transparent hover:border-borderSubtle transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sync .ics Button */}
          <button
            onClick={onExportIcs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-subtle hover:bg-borderSubtle/60 text-textPrimary border border-borderSubtle transition-all shadow-subtle"
          >
            <Download className="w-3.5 h-3.5 text-textSecondary" />
            <span className="hidden sm:inline">Export .ics</span>
          </button>

          {/* User initials circle */}
          <div className="w-7 h-7 rounded-full bg-borderStrong text-textPrimary flex items-center justify-center font-medium text-xs border border-borderSubtle">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
