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

  // 2. Initialize Google Identity Services (GSI FedCM - 100% immune to Popup Blockers)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initGsi = () => {
      if (!isMounted || !window.google?.accounts?.id || !buttonContainerRef.current) return;

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

        // Also trigger in-page One-Tap prompt if eligible
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn("GSI initialization error:", e);
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
        script.onload = initGsi;
        document.body.appendChild(script);
      } else {
        script.addEventListener("load", initGsi);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, googleLogin, resolvedTheme]);

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
      <div
        ref={buttonContainerRef}
        className="w-full flex justify-center items-center overflow-hidden rounded-xl shadow-sm hover:shadow transition-all duration-200"
      />
    </div>
  );
};
