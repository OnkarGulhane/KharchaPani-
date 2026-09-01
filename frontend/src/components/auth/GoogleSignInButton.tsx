"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const tokenClientRef = useRef<any>(null);

  const clientId =
    env.googleClientId ||
    "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com";

  const initTokenClient = () => {
    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) return;
    try {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (response: any) => {
          if (response.error) {
            console.error("Google Auth error:", response);
            setLoading(false);
            if (
              response.error !== "popup_closed_by_user" &&
              response.error !== "access_denied"
            ) {
              toast.error("Google login failed", {
                description:
                  response.error_description ||
                  "Please check your Google account permissions or origins in Google Cloud Console.",
              });
            }
            return;
          }

          if (response.access_token) {
            setLoading(true);
            try {
              await googleLogin(response.access_token);
            } catch (err: any) {
              console.error("Google login API error:", err);
            } finally {
              setLoading(false);
            }
          }
        },
        error_callback: (err: any) => {
          setLoading(false);
          console.error("Google GSI error_callback:", err);
          toast.error("Google Sign-In popup error", {
            description:
              err?.message ||
              "Popup was blocked. Please allow popups for this website.",
          });
        },
      });
    } catch (e) {
      console.error("Error creating Google token client:", e);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.oauth2) {
      initTokenClient();
    } else {
      const scriptId = "google-gsi-client-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initTokenClient();
        };
        document.body.appendChild(script);
      } else {
        script.addEventListener("load", () => {
          initTokenClient();
        });
      }
    }
  }, [clientId]);

  const handleButtonClick = () => {
    if (loading) return;

    if (tokenClientRef.current) {
      try {
        setLoading(true);
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      } catch (err) {
        setLoading(false);
        console.error("Failed to request Google token:", err);
        toast.error("Could not launch Google popup", {
          description: "Please check your browser popup settings.",
        });
      }
      return;
    }

    if (window.google?.accounts?.oauth2) {
      initTokenClient();
      if (tokenClientRef.current) {
        setLoading(true);
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
        return;
      }
    }

    toast.info("Connecting to Google...", {
      description: "Please click the button again in 1 second.",
    });
  };

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={loading}
      className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600 text-slate-200 text-sm font-semibold transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-75 group cursor-pointer"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Signing you in...</span>
        </div>
      ) : (
        <>
          <svg className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
};


