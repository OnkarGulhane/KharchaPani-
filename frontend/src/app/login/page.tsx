"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { loginSchema, LoginFormValues } from "@/lib/validations/authSchema";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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
    mode: "onChange",
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
      title="Welcome back"
      subtitle="Sign in to your Kharcha Pani workspace to manage expenses and budget goals"
      footer={
        <p className="text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group ml-1"
          >
            <span>Sign up</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      }
    >
      {/* 1-Click Google Sign-In */}
      <div className="w-full">
        <GoogleSignInButton />
      </div>

      {/* Clean Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-[1px] flex-1 bg-slate-800/90" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
          or continue with email
        </span>
        <div className="h-[1px] flex-1 bg-slate-800/90" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`w-full h-11 sm:h-12 bg-slate-950/70 border ${
                errors.email
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-emerald-400 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 font-medium mt-1 pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full h-11 sm:h-12 bg-slate-950/70 border ${
                errors.password
                  ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-emerald-400 focus:ring-emerald-500/20"
              } rounded-xl pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded-lg focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-400 font-medium mt-1 pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 sm:h-12 mt-2 flex items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
