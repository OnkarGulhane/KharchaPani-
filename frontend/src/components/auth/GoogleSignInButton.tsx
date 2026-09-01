"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { env } from "@/config/env";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const GoogleSignInButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const hasGoogleClientId = Boolean(env.googleClientId && env.googleClientId.trim());

  const handleCustomGoogleClick = () => {
    if (!hasGoogleClientId) {
      toast.info("Google Client ID not configured", {
        description: "Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your frontend .env.local file to enable live Google OAuth.",
      });
    }
  };

  if (!hasGoogleClientId) {
    return (
      <button
        type="button"
        onClick={handleCustomGoogleClick}
        className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600 text-slate-200 text-sm font-semibold transition-all duration-200 shadow-sm active:scale-[0.99] group"
      >
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
      </button>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {loading ? (
        <div className="w-full h-11 sm:h-12 flex items-center justify-center px-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
          Authenticating with Google...
        </div>
      ) : (
        <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:!w-full [&>div>iframe]:!rounded-xl [&>div>iframe]:!h-[46px]">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                setLoading(true);
                try {
                  await googleLogin(credentialResponse.credential);
                } finally {
                  setLoading(false);
                }
              }
            }}
            onError={() => {
              toast.error("Google login was cancelled or failed");
            }}
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
            width="100%"
          />
        </div>
      )}
    </div>
  );
};
