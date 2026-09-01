"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/lib/validations/authSchema";
import { authApi } from "@/lib/api/auth";
import { Lock, Loader2, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      new_password: "",
      confirm_new_password: "",
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue("token", tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        token: data.token,
        new_password: data.new_password,
      });
      toast.success("Password reset successfully!", {
        description: "All active sessions revoked. Please log in with your new password.",
      });
      router.push("/login");
    } catch (err: any) {
      toast.error("Password reset failed", {
        description: err.message || "Invalid or expired reset token.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Token Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Reset Token</label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Paste your reset token"
            {...register("token")}
            className={`w-full bg-slate-950/60 border ${
              errors.token ? "border-rose-500/80 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
            } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20`}
          />
        </div>
        {errors.token && <p className="text-xs text-rose-400 mt-1">{errors.token.message}</p>}
      </div>

      {/* New Password Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">New password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Min 8 chars (1 uppercase, 1 number)"
            {...register("new_password")}
            className={`w-full bg-slate-950/60 border ${
              errors.new_password ? "border-rose-500/80 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
            } rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.new_password && <p className="text-xs text-rose-400 mt-1">{errors.new_password.message}</p>}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Confirm new password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repeat new password"
            {...register("confirm_new_password")}
            className={`w-full bg-slate-950/60 border ${
              errors.confirm_new_password ? "border-rose-500/80 focus:border-rose-500" : "border-slate-800 focus:border-emerald-500"
            } rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirm_new_password && (
          <p className="text-xs text-rose-400 mt-1">{errors.confirm_new_password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Update Password"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a secure new password for your Kharcha Pani account"
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
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading reset form...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
