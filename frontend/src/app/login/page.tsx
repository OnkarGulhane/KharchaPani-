"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { loginSchema, LoginFormValues } from "@/lib/validations/authSchema";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, CheckSquare, Square } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch {
      // Handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      maxWidth="md"
      title="Welcome Back"
      subtitle="Sign in to your account or continue with Google to access your financial dashboard."
      footer={
        <p className="text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group ml-1"
          >
            <span>Sign up for free</span>
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
        <div className="h-[1px] flex-1 bg-slate-800/90" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
          or continue with email
        </span>
        <div className="h-[1px] flex-1 bg-slate-800/90" />
      </div>

      {/* 3. Credentials Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              {...register("email")}
              className={`w-full h-11 sm:h-12 bg-slate-950/60 border ${
                errors.email
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-4`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 font-medium mt-1 pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors hover:underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              className={`w-full h-11 sm:h-12 bg-slate-950/60 border ${
                errors.password
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-11 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-4`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg focus:outline-none"
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

        {/* Remember device checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors select-none group"
          >
            {rememberMe ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-110" />
            ) : (
              <Square className="w-4 h-4 text-slate-600 transition-colors group-hover:text-slate-500" />
            )}
            <span>Remember this device for 30 days</span>
          </button>
        </div>

        {/* 4. Primary Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 sm:h-12 mt-2 flex items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 hover:scale-[1.005] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}

