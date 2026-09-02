"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const gsiLoadedRef = useRef(false);

  const clientId =
    env.googleClientId ||
    "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com";

  // 1. Initialize Google Identity Services (GSI) for 1-click One-Tap & FedCM
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initGsi = () => {
      if (!isMounted || gsiLoadedRef.current) return;
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response?.credential) {
                if (isMounted) setLoading(true);
                try {
                  await googleLogin(response.credential);
                } catch (err: any) {
                  console.error("GSI Login Error:", err);
                  toast.error("Google Sign-In failed", {
                    description: err?.message || "Authentication error.",
                  });
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_button: true,
          });

          gsiLoadedRef.current = true;
          // Trigger smooth One-Tap prompt if eligible
          try {
            window.google.accounts.id.prompt();
          } catch {
            // Optional prompt
          }
        } catch (e) {
          console.warn("GSI initialization warning:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const scriptId = "google-gsi-client-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initGsi();
        document.body.appendChild(script);
      } else {
        script.addEventListener("load", () => initGsi());
      }
    }

    // 2. Listen for postMessage from popup window
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data?.token) {
        if (isMounted) setLoading(true);
        try {
          await googleLogin(event.data.token);
        } catch (err: any) {
          toast.error("Google Sign-In failed", {
            description: err?.message || "Authentication error.",
          });
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [clientId, googleLogin]);

  // 3. Primary Button Click: Triggers Google OAuth
  const handleGoogleSignIn = () => {
    if (loading) return;
    setLoading(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const redirectUri = `${origin}/auth/callback`;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "token id_token",
        scope: "openid email profile",
        nonce: Math.random().toString(36).substring(2),
        prompt: "select_account",
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Open centered popup window
      const width = 500;
      const height = 650;
      const left =
        typeof window !== "undefined"
          ? window.screenX + (window.outerWidth - width) / 2
          : 100;
      const top =
        typeof window !== "undefined"
          ? window.screenY + (window.outerHeight - height) / 2.5
          : 100;

      const popup = window.open(
        authUrl,
        "KharchaPaniGoogleSignIn",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      // Fallback for mobile or popup blocker
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        window.location.href = authUrl;
        return;
      }

      // Check for popup closure
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setLoading(false);
        }
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      toast.error("Failed to initiate Google sign in", {
        description: err?.message || "Please check your network connection.",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800/90 hover:border-slate-600 text-slate-100 font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span className="text-slate-300">Connecting to Google...</span>
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
          <span className="tracking-tight text-slate-100 font-medium">Continue with Google</span>
        </>
      )}
    </button>
  );
};
