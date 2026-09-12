"use client";

import React, { useState } from "react";
import { 
  Lock, 
  ExternalLink, 
  ArrowRight
} from "lucide-react";

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectSuccess: (email: string) => void;
}

export const GoogleConnectModal: React.FC<GoogleConnectModalProps> = ({
  isOpen,
  onClose,
  onConnectSuccess,
}) => {
  const [clientId, setClientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  if (!isOpen) return null;

  const handleSimulateOAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onConnectSuccess(testEmail || "student@cs.university.edu");
      onClose();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface border border-borderStrong p-6 shadow-elevated space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-textPrimary">
              Connect Google Classroom
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Sync enrolled courses and active coursework via Google OAuth 2.0
            </p>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary text-xs p-1">✕</button>
        </div>

        <div className="p-3 rounded-lg bg-subtle border border-borderSubtle text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-textPrimary">
            <Lock className="w-3.5 h-3.5 text-textSecondary" />
            <span>Read-only permissions:</span>
          </div>
          <p className="text-[11px] text-textSecondary leading-relaxed">
            ClassPulse only requests view access to your enrolled courses, coursework, and announcements. Your data stays private.
          </p>
        </div>

        <form onSubmit={handleSimulateOAuth} className="space-y-3 text-xs">
          <div>
            <label className="block text-textSecondary mb-1 font-medium">
              Student University Email
            </label>
            <input
              type="email"
              placeholder="e.g. your_id@university.edu"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-textSecondary font-medium">
                Google Cloud Client ID (Optional)
              </label>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-textSecondary hover:text-textPrimary flex items-center gap-0.5 underline"
              >
                <span>Google Console</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="text"
              placeholder="CLIENT_ID.apps.googleusercontent.com"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong font-mono text-[10px]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-3 rounded-md bg-textPrimary hover:opacity-90 text-surface font-medium transition-opacity flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <span>Sign In & Sync</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
};
