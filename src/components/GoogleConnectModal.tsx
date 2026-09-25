"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Key
} from "lucide-react";
import { fetchLiveGoogleClassroom } from "../lib/googleClassroom";
import { Course, Assignment } from "../types/classroom";

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: (data: { courses: Course[]; assignments: Assignment[]; email: string }) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleConnectModal: React.FC<GoogleConnectModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"oauth" | "token">("oauth");
  const [clientId, setClientId] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState("f240518@cfd.nu.edu.pk");

  useEffect(() => {
    // Check if client ID is set in env
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (envClientId) {
      setClientId(envClientId);
    }
  }, []);

  if (!isOpen) return null;

  // 1. Google Identity Services Real OAuth2 Flow
  const handleInitiateOAuth = () => {
    setErrorMessage(null);

    if (!clientId.trim()) {
      setErrorMessage(
        "Please provide a Google Cloud Client ID (or use the Access Token tab). See below for instructions."
      );
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      setErrorMessage("Google Identity Services script is still loading. Please try again in a few seconds.");
      return;
    }

    try {
      setIsLoading(true);
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly",
        hint: studentEmail,
        callback: async (response: any) => {
          if (response.error) {
            setIsLoading(false);
            setErrorMessage(`Google authorization error: ${response.error}`);
            return;
          }

          try {
            const data = await fetchLiveGoogleClassroom(response.access_token);
            onSyncSuccess({
              courses: data.courses,
              assignments: data.assignments,
              email: studentEmail,
            });
            setIsLoading(false);
            onClose();
          } catch (err: any) {
            setIsLoading(false);
            setErrorMessage(err.message || "Failed to fetch courses from Google Classroom API");
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Could not launch Google authentication dialog.");
    }
  };

  // 2. Direct Access Token Fetch
  const handleSyncWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await fetchLiveGoogleClassroom(manualToken.trim());
      onSyncSuccess({
        courses: data.courses,
        assignments: data.assignments,
        email: studentEmail,
      });
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Invalid or expired Google OAuth Token.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface border border-borderStrong p-6 shadow-elevated space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-textPrimary">
              Connect FAST Google Classroom
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Live coursework & assignment synchronization via Google Classroom API
            </p>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary text-xs p-1">✕</button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 border-b border-borderSubtle pb-1 text-xs">
          <button
            onClick={() => setActiveTab("oauth")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "oauth"
                ? "bg-textPrimary text-surface"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Google Sign-In (OAuth 2.0)
          </button>
          <button
            onClick={() => setActiveTab("token")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "token"
                ? "bg-textPrimary text-surface"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Direct Access Token
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {activeTab === "oauth" && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-textSecondary mb-1 font-medium">
                Student FAST-NU Email
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-canvas border border-borderSubtle text-textPrimary font-mono text-xs focus:outline-none focus:border-borderStrong"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-textSecondary font-medium">
                  Google Cloud Client ID
                </label>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-textSecondary hover:text-textPrimary flex items-center gap-0.5 underline"
                >
                  <span>Google Console</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="text"
                placeholder="YOUR_CLIENT_ID.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong font-mono text-[11px]"
              />
              <p className="text-[11px] text-textMuted mt-1 leading-relaxed">
                Created under Google Cloud Console with Google Classroom API enabled.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-subtle border border-borderSubtle space-y-1">
              <span className="font-semibold text-textPrimary text-[11px] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-textSecondary" />
                Official OAuth Security Notice:
              </span>
              <p className="text-[11px] text-textSecondary leading-relaxed">
                Google protects university accounts with strict OAuth 2.0. You never enter your password into ClassPulse. Clicking below will open Google's authentic sign-in dialog for <strong>{studentEmail}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleInitiateOAuth}
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-md bg-textPrimary hover:opacity-90 text-surface font-semibold text-xs transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting Google Classroom...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize with Google ({studentEmail})</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-md bg-subtle hover:bg-borderSubtle text-textSecondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {activeTab === "token" && (
          <form onSubmit={handleSyncWithToken} className="space-y-3 text-xs">
            <div>
              <label className="block text-textSecondary mb-1 font-medium">
                Google OAuth Bearer Access Token
              </label>
              <textarea
                rows={3}
                required
                placeholder="ya29.a0AfH6SM..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong font-mono text-[11px]"
              />
              <p className="text-[11px] text-textMuted mt-1">
                You can generate a temporary test token at{" "}
                <a
                  href="https://developers.google.com/oauthplayground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-textSecondary hover:text-textPrimary"
                >
                  OAuth 2.0 Playground
                </a>{" "}
                with scope <code>https://www.googleapis.com/auth/classroom.courses.readonly</code>.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-md bg-textPrimary hover:opacity-90 text-surface font-semibold text-xs transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching live coursework...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Fetch Live Google Classroom</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-md bg-subtle hover:bg-borderSubtle text-textSecondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
