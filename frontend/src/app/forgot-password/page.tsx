"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/lib/validations/authSchema";
import { authApi } from "@/lib/api/auth";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(data.email);
      setIsSent(true);
      if (res?.reset_token) {
        setDevResetToken(res.reset_token);
      }
      toast.success("Password reset request sent", {
        description: "If the email is registered, instructions have been generated.",
      });
    } catch (err: any) {
      toast.error("Failed to submit request", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a password recovery link"
      footer={
        <Link
          href="/login"
          className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      }
    >
      {isSent ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-300">
            If an account exists with that email, a password reset link has been dispatched.
          </p>

          {devResetToken && (
            <div className="mt-4 p-3.5 bg-slate-950/80 border border-indigo-500/30 rounded-xl text-left">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                Development Quick Reset Link
              </span>
              <Link
                href={`/reset-password?token=${devResetToken}`}
                className="text-xs text-emerald-400 hover:underline break-all"
              >
                Click here to reset password with token ({devResetToken.slice(0, 16)}...)
              </Link>
            </div>
          )}

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors mt-2"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`w-full bg-slate-950/60 border ${
                  errors.email ? "border-rose-500/80 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
                } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
