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
  Key,
  HelpCircle,
  Sparkles,
  Copy,
  Check
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
  const [activeTab, setActiveTab] = useState<"token" | "oauth">("token");
  const [clientId, setClientId] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState("f240518@cfd.nu.edu.pk");
  const [copiedScope, setCopiedScope] = useState(false);

  useEffect(() => {
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (envClientId) {
      setClientId(envClientId);
    }
  }, []);

  if (!isOpen) return null;

  const copyScopes = () => {
    navigator.clipboard.writeText(
      "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly"
    );
    setCopiedScope(true);
    setTimeout(() => setCopiedScope(false), 2000);
  };

  // 1. Direct Access Token Fetch (Fastest, zero setup via OAuth Playground)
  const handleSyncWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setErrorMessage("Please paste your Google OAuth Access Token.");
      return;
    }

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
      setErrorMessage(
        err.message || "Invalid or expired Google token. Please check that you selected Classroom scopes."
      );
    }
  };

  // 2. Google Identity Services Real OAuth2 Flow
  const handleInitiateOAuth = () => {
    setErrorMessage(null);

    if (!clientId.trim()) {
      setErrorMessage(
        "Google requires a Client ID from Google Cloud Console to open the popup. Alternatively, use the '1-Click Token (No Setup)' tab above!"
      );
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      setErrorMessage("Google Identity Services script is loading. Please try again in 3 seconds.");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
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
              Live sync for student: <span className="font-mono text-textPrimary font-medium">{studentEmail}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary text-xs p-1">✕</button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 border-b border-borderSubtle pb-1 text-xs">
          <button
            onClick={() => setActiveTab("token")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "token"
                ? "bg-textPrimary text-surface"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Fastest: OAuth Playground Token (No Setup)
          </button>
          <button
            onClick={() => setActiveTab("oauth")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "oauth"
                ? "bg-textPrimary text-surface"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            Google Cloud Client ID
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Tab 1: Fastest OAuth Playground Token */}
        {activeTab === "token" && (
          <form onSubmit={handleSyncWithToken} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-lg bg-subtle border border-borderSubtle space-y-2">
              <span className="font-semibold text-textPrimary text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                How to get your live Google Classroom token (30 Seconds):
              </span>
              <ol className="text-[11px] text-textSecondary space-y-1 list-decimal list-inside leading-relaxed">
                <li>
                  Open{" "}
                  <a
                    href="https://developers.google.com/oauthplayground"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-textPrimary font-semibold"
                  >
                    Google OAuth Playground ↗
                  </a>
                </li>
                <li>
                  Scroll down the left list to <strong>Google Classroom API v1</strong> and check:
                  <div className="mt-1 font-mono text-[10px] bg-canvas p-1 rounded border border-borderSubtle text-textPrimary flex items-center justify-between">
                    <span>.../auth/classroom.courses.readonly</span>
                    <button
                      type="button"
                      onClick={copyScopes}
                      className="text-[10px] text-textSecondary hover:text-textPrimary flex items-center gap-1 px-1.5 py-0.5 rounded bg-subtle"
                    >
                      {copiedScope ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScope ? "Copied" : "Copy Scope"}</span>
                    </button>
                  </div>
                </li>
                <li>
                  Click the blue <strong>Authorize APIs</strong> button and sign in with{" "}
                  <strong>{studentEmail}</strong>.
                </li>
                <li>
                  Click <strong>Exchange authorization code for tokens</strong>, then copy the{" "}
                  <strong>Access token</strong> (starts with <code>ya29...</code>).
                </li>
              </ol>
            </div>

            <div>
              <label className="block text-textSecondary mb-1 font-medium">
                Paste Google Access Token (ya29...)
              </label>
              <textarea
                rows={2}
                required
                placeholder="ya29.a0AfH6SM..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-md bg-textPrimary hover:opacity-90 text-surface font-semibold text-xs transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing Live Google Classroom...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Sync Live Courses & Deadlines</span>
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

        {/* Tab 2: Google Cloud Client ID */}
        {activeTab === "oauth" && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-textSecondary mb-1 font-medium">
                Google Cloud Client ID
              </label>
              <input
                type="text"
                placeholder="YOUR_CLIENT_ID.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong font-mono text-[11px]"
              />
              <p className="text-[11px] text-textMuted mt-1">
                To create a permanent Client ID: go to{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-textPrimary"
                >
                  Google Cloud Console
                </a>
                , create OAuth 2.0 Client ID (Web Application), and add <code>http://localhost:3000</code> to Authorized Origins.
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
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Launch Google Sign-In</span>
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
      </div>
    </div>
  );
};
