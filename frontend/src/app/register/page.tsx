"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { registerSchema, RegisterFormValues } from "@/lib/validations/authSchema";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    mode: "onChange",
  });

  const passwordValue = watch("password") || "";
  const confirmPasswordValue = watch("confirm_password") || "";

  // Real-time password requirement checks
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const isMatching =
    confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;

  const strengthScore = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await registerUser(data.full_name, data.email, data.password);
      setRegisteredEmail(data.email);
    } catch {
      // Error handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail || isResending) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(registeredEmail);
      toast.success("Verification email resent!", {
        description: `We sent a new link to ${registeredEmail}`,
      });
    } catch (err: any) {
      toast.error("Failed to resend email", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  // If successfully registered, show the Verification Requirement screen
  if (registeredEmail) {
    return (
      <AuthCard
        maxWidth="md"
        title="Verify Your Email"
        subtitle="We've sent a verification link to activate your account."
        footer={
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-center">
            Ready to sign in?{" "}
            <Link
              href="/login"
              className="text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-semibold hover:text-emerald-300 dark:hover:text-emerald-300 light:hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group ml-1"
            >
              <span>Go to Sign in</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        }
      >
        <div className="space-y-6 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
              Check your inbox
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed max-w-sm mx-auto">
              We sent a verification link to{" "}
              <span className="font-semibold text-emerald-400 dark:text-emerald-400 light:text-emerald-600 break-all">
                {registeredEmail}
              </span>
              . Click the link to activate your account.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Link expires in 30 minutes</span>
            </div>
            <p className="text-[11px] pl-6 text-slate-500">
              Can't find it? Make sure to check your Spam or Junk folder.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 font-semibold text-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Resending email...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Resend verification email</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all"
            >
              <span>Sign In with Verified Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      maxWidth="md"
      title="Create Your Account"
      subtitle="Sign up for free to start managing expenses and tracking your budget targets."
      footer={
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-semibold hover:text-emerald-300 dark:hover:text-emerald-300 light:hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group ml-1"
          >
            <span>Sign in</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      }
    >
      {/* 1. Quick 1-Click Google Sign-In */}
      <div className="w-full flex flex-col items-center">
        <GoogleSignInButton />
      </div>

      {/* 2. Sleek Visual Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="h-[1px] flex-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-200" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 light:text-slate-400 select-none">
          or register with email
        </span>
        <div className="h-[1px] flex-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
            Full Name
          </label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-slate-500 dark:text-slate-500 light:text-slate-400 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type="text"
              placeholder="e.g. Onkar Gulhane"
              {...register("full_name")}
              className={`w-full h-11 sm:h-12 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50/90 border ${
                errors.full_name
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 dark:border-slate-800 light:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-4 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-600 dark:placeholder:text-slate-600 light:placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-4`}
            />
          </div>
          {errors.full_name && (
            <p className="text-[11px] text-rose-400 font-medium mt-1 pl-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-500 dark:text-slate-500 light:text-slate-400 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              {...register("email")}
              className={`w-full h-11 sm:h-12 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50/90 border ${
                errors.email
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 dark:border-slate-800 light:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-4 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-600 dark:placeholder:text-slate-600 light:placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-4`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 font-medium mt-1 pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-500 dark:text-slate-500 light:text-slate-400 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register("password")}
              className={`w-full h-11 sm:h-12 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50/90 border ${
                errors.password
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 dark:border-slate-800 light:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-11 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-600 dark:placeholder:text-slate-600 light:placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-4`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 text-slate-500 dark:text-slate-500 light:text-slate-400 hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-700 transition-colors p-1 rounded-lg focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-400 font-medium mt-1 pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-500 dark:text-slate-500 light:text-slate-400 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              {...register("confirm_password")}
              className={`w-full h-11 sm:h-12 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50/90 border ${
                errors.confirm_password
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 dark:border-slate-800 light:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-11 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-600 dark:placeholder:text-slate-600 light:placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-4`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 text-slate-500 dark:text-slate-500 light:text-slate-400 hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-700 transition-colors p-1 rounded-lg focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-[11px] text-rose-400 font-medium mt-1 pl-1">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        {/* Password Strength & Requirements Checklist */}
        {passwordValue.length > 0 && (
          <div className="p-3 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50/90 border border-slate-800/90 dark:border-slate-800/90 light:border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium">Password strength:</span>
              <span
                className={`text-[11px] font-bold ${
                  strengthScore === 3
                    ? "text-emerald-400 dark:text-emerald-400 light:text-emerald-600"
                    : strengthScore === 2
                    ? "text-amber-400 dark:text-amber-400 light:text-amber-600"
                    : "text-rose-400 dark:text-rose-400 light:text-rose-600"
                }`}
              >
                {strengthScore === 3 ? "Strong" : strengthScore === 2 ? "Moderate" : "Weak"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
              <div
                className={`rounded-full transition-colors duration-300 ${
                  strengthScore >= 1 ? "bg-rose-500" : "bg-slate-800 dark:bg-slate-800 light:bg-slate-200"
                }`}
              />
              <div
                className={`rounded-full transition-colors duration-300 ${
                  strengthScore >= 2 ? "bg-amber-400" : "bg-slate-800 dark:bg-slate-800 light:bg-slate-200"
                }`}
              />
              <div
                className={`rounded-full transition-colors duration-300 ${
                  strengthScore >= 3 ? "bg-emerald-400" : "bg-slate-800 dark:bg-slate-800 light:bg-slate-200"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <div
                className={`flex items-center gap-1.5 text-[11px] ${
                  hasMinLength ? "text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-medium" : "text-slate-500 dark:text-slate-500 light:text-slate-400"
                }`}
              >
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600 light:text-slate-400 flex-shrink-0" />
                )}
                <span>8+ characters</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[11px] ${
                  hasUppercase ? "text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-medium" : "text-slate-500 dark:text-slate-500 light:text-slate-400"
                }`}
              >
                {hasUppercase ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600 light:text-slate-400 flex-shrink-0" />
                )}
                <span>1 Uppercase</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[11px] ${
                  hasNumber ? "text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-medium" : "text-slate-500 dark:text-slate-500 light:text-slate-400"
                }`}
              >
                {hasNumber ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600 light:text-slate-400 flex-shrink-0" />
                )}
                <span>1 Number</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[11px] ${
                  isMatching ? "text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-medium" : "text-slate-500 dark:text-slate-500 light:text-slate-400"
                }`}
              >
                {isMatching ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600 light:text-slate-400 flex-shrink-0" />
                )}
                <span>Passwords match</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 sm:h-12 mt-2 flex items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 hover:scale-[1.005] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
