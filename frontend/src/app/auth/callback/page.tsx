"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse access_token from hash fragment: #access_token=...&token_type=Bearer
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        // Also check query params in case of code or token
        const searchParams = new URLSearchParams(window.location.search);
        const queryToken = searchParams.get("access_token") || searchParams.get("id_token");
        const token = accessToken || queryToken;

        if (!token) {
          const errorParam = searchParams.get("error") || params.get("error");
          if (errorParam) {
            throw new Error(`Google Authentication was denied: ${errorParam}`);
          }
          throw new Error("No authentication token received from Google");
        }

        await googleLogin(token);
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Failed to complete Google authentication");
        toast.error("Google authentication failed", {
          description: err.message || "Please try signing in again.",
        });
        setTimeout(() => {
          router.replace("/login");
        }, 2500);
      }
    };

    processCallback();
  }, [googleLogin, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070b14]">
      <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-xs text-slate-400 mb-4">{error}</p>
            <p className="text-[11px] text-slate-500">Redirecting back to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Signing you into Kharcha Pani...</h2>
            <p className="text-xs text-slate-400">Verifying your Google account credentials, please wait.</p>
          </>
        )}
      </div>
    </div>
  );
}
