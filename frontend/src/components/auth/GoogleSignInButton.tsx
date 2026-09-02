"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { env } from "@/config/env";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleSignInButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("Connecting to Google...");

  const clientId =
    env.googleClientId ||
    "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com";

  // Pre-warm Render backend service on mount to eliminate cold-start lag
  useEffect(() => {
    try {
      const healthUrl = `${env.apiBaseUrl.replace(/\/api\/v1\/?$/, "")}/health`;
      fetch(healthUrl, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {});
    } catch {}
  }, []);

  const handleGoogleSignIn = useCallback(() => {
    if (loading) return;

    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      toast.info("Google Authentication is preparing...", {
        description: "Please click again in a moment.",
      });
      return;
    }

    setLoading(true);
    setLoadingStep("Opening Google account chooser...");

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 25000);

    try {
      // Initialize Token Client directly in user gesture stack
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (response: any) => {
          clearTimeout(safetyTimer);
          if (response?.access_token) {
            setLoading(true);
            setLoadingStep("Signing you in securely...");
            try {
              await googleLogin(response.access_token);
            } catch (err: any) {
              console.error("Google Auth error:", err);
              toast.error("Google Sign-In failed", {
                description: err?.message || "Authentication failed. Please try again.",
              });
            } finally {
              setLoading(false);
            }
          } else if (response?.error) {
            setLoading(false);
            if (response.error !== "popup_closed_by_user") {
              toast.error("Google Sign-In error", {
                description: response.error_description || response.error,
              });
            }
          } else {
            setLoading(false);
          }
        },
        error_callback: (err: any) => {
          clearTimeout(safetyTimer);
          setLoading(false);
          console.warn("Google token client error:", err);
          if (err?.type === "popup_failed_to_open" || err?.type === "popup_closed") {
            toast.error("Google popup was blocked by browser", {
              description: "Please enable popups for this site or try logging in with email.",
            });
          }
        },
      });

      // Synchronous requestAccessToken within user click handler (Chrome User Gesture compliant)
      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      clearTimeout(safetyTimer);
      setLoading(false);
      console.error("Token client execution error:", err);
      toast.error("Could not start Google Sign-In", {
        description: err?.message || "Please check your browser settings and try again.",
      });
    }
  }, [clientId, googleLogin, loading]);

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white hover:bg-slate-800/90 dark:hover:bg-slate-800/90 light:hover:bg-slate-50 hover:border-slate-600 dark:hover:border-slate-600 light:hover:border-slate-400 text-slate-100 dark:text-slate-100 light:text-slate-800 font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400 dark:text-emerald-400 light:text-emerald-600" />
          <span className="text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium animate-pulse">
            {loadingStep}
          </span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="tracking-tight font-medium">Continue with Google</span>
        </>
      )}
    </button>
  );
};
