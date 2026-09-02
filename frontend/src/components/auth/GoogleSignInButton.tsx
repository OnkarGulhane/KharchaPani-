"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { env } from "@/config/env";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/providers/ThemeProvider";

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleSignInButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const clientId =
    env.googleClientId ||
    "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com";

  // 1. Pre-warm Render backend service on mount
  useEffect(() => {
    try {
      const healthUrl = `${env.apiBaseUrl.replace(/\/api\/v1\/?$/, "")}/health`;
      fetch(healthUrl, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {});
    } catch {}
  }, []);

  // 2. Load Google Identity Services SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const scriptId = "google-gsi-client-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onScriptSuccess = () => {
      if (isMounted) {
        setScriptLoaded(true);
        setScriptError(false);
      }
    };

    const onScriptFail = () => {
      if (isMounted) {
        setScriptError(true);
      }
    };

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
    } else if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = onScriptSuccess;
      script.onerror = onScriptFail;
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", onScriptSuccess);
      script.addEventListener("error", onScriptFail);
    }

    // Safety timeout: If SDK is blocked by browser extension after 4s, show fallback
    const fallbackTimer = setTimeout(() => {
      if (isMounted && !window.google?.accounts?.id) {
        setScriptError(true);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // 3. Render Google's native FedCM compliant button (100% Cross-Platform: Chrome, Edge, Safari, Firefox)
  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || !buttonContainerRef.current) return;

    let isMounted = true;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response?.credential && isMounted) {
            setLoading(true);
            try {
              await googleLogin(response.credential);
            } catch (err: any) {
              console.error("Google Auth error:", err);
              toast.error("Google Sign-In failed", {
                description: err?.message || "Authentication failed. Please try again.",
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

      // Clear container and render official Google FedCM button
      buttonContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: resolvedTheme === "light" ? "outline" : "filled_black",
        size: "large",
        type: "standard",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        width: 320,
      });

      // Trigger in-page prompt if supported
      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn("GSI initialization error:", e);
    }

    return () => {
      isMounted = false;
    };
  }, [scriptLoaded, clientId, googleLogin, resolvedTheme]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[48px] relative">
      {loading && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2.5 z-20">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span className="text-xs text-slate-200 font-medium animate-pulse">
            Signing you in securely...
          </span>
        </div>
      )}

      {scriptError && !scriptLoaded ? (
        <div className="w-full text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          Google authentication service was blocked by your browser extensions. Please use email & password sign-in below.
        </div>
      ) : (
        <div
          ref={buttonContainerRef}
          className="w-full flex justify-center items-center overflow-hidden rounded-xl shadow-sm hover:shadow transition-all duration-200"
        />
      )}
    </div>
  );
};
