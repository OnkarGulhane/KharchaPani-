"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { authApi } from "@/lib/api/auth";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Mail,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? "" : "No verification token provided."
  );
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        if (isMounted) {
          setStatus("success");
          toast.success("Email verified successfully!", {
            description: "Your account is active. You can now log in.",
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            err.message || "Invalid or expired verification link. Please request a new one."
          );
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || isResending) return;

    setIsResending(true);
    try {
      await authApi.resendVerification(resendEmail);
      setResendSuccess(true);
      toast.success("Verification link sent!", {
        description: `Check ${resendEmail} for the new activation link.`,
      });
    } catch (err: any) {
      toast.error("Failed to resend", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <AuthCard
        maxWidth="sm"
        title="Verifying Your Email"
        subtitle="Please wait while we validate your activation token..."
      >
        <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium animate-pulse">
            Connecting to secure verification service...
          </p>
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard
        maxWidth="sm"
        title="Email Verified!"
        subtitle="Your account is fully activated and ready to use."
        footer={
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-center">
            Questions? Contact support anytime.
          </p>
        }
      >
        <div className="space-y-6 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 flex items-center justify-center gap-1.5">
              <span>Account Activated</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
              Your email address has been confirmed. You can now sign in to start tracking your expenses and budgeting.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full h-12 flex items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 hover:scale-[1.005] active:scale-[0.99]"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      maxWidth="sm"
      title="Verification Failed"
      subtitle="The verification link could not be validated."
      footer={
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-center">
          Already verified?{" "}
          <Link
            href="/login"
            className="text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-semibold hover:text-emerald-300 transition-colors inline-flex items-center gap-1 ml-1"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      }
    >
      <div className="space-y-5 text-center py-1">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-rose-400" />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm text-rose-300 font-medium">
            {errorMessage}
          </p>
          <p className="text-xs text-slate-400">
            Verification links expire after 30 minutes and can only be used once.
          </p>
        </div>

        {resendSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs text-emerald-300 font-medium">
              A new verification link has been sent to your email!
            </p>
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Request a new link
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full h-11 bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isResending || !resendEmail}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Send New Verification Link</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthCard maxWidth="sm" title="Loading..." subtitle="Preparing verification...">
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        </AuthCard>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
