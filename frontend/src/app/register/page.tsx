"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { registerSchema, RegisterFormValues } from "@/lib/validations/authSchema";
import { useAuth } from "@/context/AuthContext";
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
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Password rules validation for live visual feedback
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const isMatching =
    confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;

  const strengthScore = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.full_name, data.email, data.password);
    } catch {
      // Error handled with toast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      maxWidth="lg"
      title="Create your account"
      subtitle="Sign up to get instant access to personal analytics, budgets, and smart expense tracking"
      footer={
        <p className="text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group ml-1"
          >
            Sign in
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      }
    >
      {/* 1-Click Google Sign-In */}
      <GoogleSignInButton />

      {/* Modern Clean Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-800/90 w-full" />
        <span className="bg-slate-900 px-3.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium select-none">
          Or register with email
        </span>
        <div className="border-t border-slate-800/90 w-full" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Full Name & Email Address in Balanced 2-Col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Full Name</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Onkar Gulhane"
                {...register("full_name")}
                className={`w-full h-11 bg-slate-950/70 border ${
                  errors.full_name
                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                } rounded-xl pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2`}
              />
            </div>
            {errors.full_name && (
              <p className="text-[11px] text-rose-400 font-medium pl-1">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Email Address</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`w-full h-11 bg-slate-950/70 border ${
                  errors.email
                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                } rounded-xl pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 font-medium pl-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Password & Confirm Password in Balanced 2-Col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Password</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create strong password"
                {...register("password")}
                className={`w-full h-11 bg-slate-950/70 border ${
                  errors.password
                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                } rounded-xl pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded-lg focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 font-medium pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Confirm Password</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("confirm_password")}
                className={`w-full h-11 bg-slate-950/70 border ${
                  errors.confirm_password
                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
                } rounded-xl pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded-lg focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-[11px] text-rose-400 font-medium pl-1">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </div>

        {/* Live Password Requirements & Strength Indicator */}
        {passwordValue.length > 0 && (
          <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-2 text-xs">
            {/* Strength Bar */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Password strength:
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  strengthScore === 3
                    ? "text-emerald-400"
                    : strengthScore === 2
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {strengthScore === 3
                  ? "Strong"
                  : strengthScore === 2
                  ? "Moderate"
                  : "Weak"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
              <div
                className={`rounded-full transition-colors duration-300 ${
                  strengthScore >= 1 ? "bg-rose-500" : "bg-slate-800"
                }`}
              />
              <div
                className={`rounded-full transition-colors duration-300 ${
                  strengthScore >= 2 ? "bg-amber-400" : "bg-slate-800"
                }`}
              />
              <div
                className={`rounded-full transition-colors duration-300 ${
                  strengthScore >= 3 ? "bg-emerald-400" : "bg-slate-800"
                }`}
              />
            </div>

            {/* Checklist Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              <div
                className={`flex items-center gap-1 text-[11px] ${
                  hasMinLength ? "text-emerald-400 font-medium" : "text-slate-500"
                }`}
              >
                {hasMinLength ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3 text-slate-600" />
                )}
                <span>8+ characters</span>
              </div>
              <div
                className={`flex items-center gap-1 text-[11px] ${
                  hasUppercase ? "text-emerald-400 font-medium" : "text-slate-500"
                }`}
              >
                {hasUppercase ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3 text-slate-600" />
                )}
                <span>1 Uppercase</span>
              </div>
              <div
                className={`flex items-center gap-1 text-[11px] ${
                  hasNumber ? "text-emerald-400 font-medium" : "text-slate-500"
                }`}
              >
                {hasNumber ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3 text-slate-600" />
                )}
                <span>1 Number</span>
              </div>
              <div
                className={`flex items-center gap-1 text-[11px] ${
                  isMatching ? "text-emerald-400 font-medium" : "text-slate-500"
                }`}
              >
                {isMatching ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3 text-slate-600" />
                )}
                <span>Match</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
