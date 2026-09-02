"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { env } from "@/config/env";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: any;
  }
}

let isGsiInitialized = false;

export const GoogleSignInButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("Connecting to Google...");
  const tokenClientRef = useRef<any>(null);

  const clientId =
    env.googleClientId ||
    "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com";

  // 1. Pre-warm Render backend service on mount to eliminate cold-start lag
  useEffect(() => {
    try {
      const healthUrl = `${env.apiBaseUrl.replace(/\/api\/v1\/?$/, "")}/health`;
      fetch(healthUrl, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {});
    } catch {}
  }, []);

  // 2. Pre-initialize Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const setupGoogle = () => {
      if (!isMounted) return;

      // 2a. In-Page ID Token listener (One-Tap / FedCM)
      if (window.google?.accounts?.id && !isGsiInitialized) {
        try {
          isGsiInitialized = true;
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response?.credential && isMounted) {
                setLoading(true);
                setLoadingStep("Signing you in securely...");
                try {
                  await googleLogin(response.credential);
                } catch (err: any) {
                  toast.error("Google Sign-In failed", {
                    description: err?.message || "Authentication failed.",
                  });
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true,
          });
        } catch (e) {
          console.warn("GSI init warning:", e);
        }
      }

      // 2b. Google OAuth2 Token Client
      if (window.google?.accounts?.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "openid email profile",
            callback: async (response: any) => {
              if (!isMounted) return;
              if (response?.access_token) {
                setLoading(true);
                setLoadingStep("Verifying Google account...");
                try {
                  await googleLogin(response.access_token);
                } catch (err: any) {
                  console.error("Google Auth error:", err);
                  toast.error("Google Sign-In failed", {
                    description: err?.message || "Authentication failed. Please try again.",
                  });
                } finally {
                  if (isMounted) setLoading(false);
                }
              } else if (response?.error) {
                if (isMounted) setLoading(false);
                if (response.error !== "popup_closed_by_user") {
                  toast.error("Google Sign-In was cancelled or failed");
                }
              } else {
                if (isMounted) setLoading(false);
              }
            },
            error_callback: (err: any) => {
              if (!isMounted) return;
              setLoading(false);
              console.warn("Token client error:", err);
              // Fallback to in-page One-Tap prompt if popup is blocked
              if (window.google?.accounts?.id) {
                try {
                  window.google.accounts.id.prompt();
                } catch {}
              }
            },
          });
        } catch (e) {
          console.warn("Token client init warning:", e);
        }
      }
    };

    if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const scriptId = "google-gsi-client-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = setupGoogle;
        document.body.appendChild(script);
      } else {
        script.addEventListener("load", setupGoogle);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, googleLogin]);

  // Direct User-Gesture Click Handler
  const handleGoogleSignIn = useCallback(() => {
    if (loading) return;

    setLoading(true);
    setLoadingStep("Opening Google account chooser...");

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 25000);

    // 1. Try Token Client
    if (tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (e) {
        clearTimeout(safetyTimer);
        setLoading(false);
        console.warn("Token client call failed:", e);
      }
    }

    // 2. Try on-demand init
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (response: any) => {
            clearTimeout(safetyTimer);
            if (response?.access_token) {
              setLoadingStep("Signing you in...");
              try {
                await googleLogin(response.access_token);
              } catch (err: any) {
                toast.error("Google Sign-In failed", {
                  description: err?.message || "Authentication failed.",
                });
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
          error_callback: () => {
            clearTimeout(safetyTimer);
            setLoading(false);
            if (window.google?.accounts?.id) {
              try {
                window.google.accounts.id.prompt();
              } catch {}
            }
          },
        });
        tokenClientRef.current = client;
        client.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (e) {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    }

    // 3. Fallback to One-Tap
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            clearTimeout(safetyTimer);
            setLoading(false);
          }
        });
        return;
      } catch (e) {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    }

    clearTimeout(safetyTimer);
    setLoading(false);
    toast.info("Google Authentication is preparing...", {
      description: "Please click again in a moment.",
    });
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
