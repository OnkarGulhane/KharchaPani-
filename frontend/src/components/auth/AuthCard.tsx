"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/common/ThemeToggle";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footer,
  maxWidth = "md",
}) => {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-[440px]",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#070b14] dark:bg-[#070b14] light:bg-slate-100/90 relative overflow-hidden select-none transition-colors duration-300">
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <ThemeToggle variant="floating" />
      </div>

      {/* Dynamic ambient gradient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/10 light:bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/10 light:bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/5 dark:bg-indigo-500/5 light:bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle modern dot-grid background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] light:bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full ${maxWidthClass} bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-2xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] light:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] p-6 sm:p-8 z-10 relative overflow-hidden select-text`}
      >
        {/* Top subtle emerald laser glow rim */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-3 mb-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/35 transition-all">
              <div className="w-full h-full bg-slate-950 dark:bg-slate-950 light:bg-white rounded-[14px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 transition-transform group-hover:rotate-[-6deg]" />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight leading-tight font-sans">
                  Kharcha<span className="text-emerald-400 dark:text-emerald-400 light:text-emerald-600">Pani</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> PRO
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-400 light:text-slate-500 block">
                Smart Expense & Budget Hub
              </span>
            </div>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight mt-2">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1.5 max-w-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Card Body */}
        <div className="space-y-4">{children}</div>

        {/* Security & Privacy Assurance Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
          <span>Zero-Trust Architecture & Encrypted Isolation</span>
        </div>

        {/* Card Footer (e.g. Sign up / Sign in switcher) */}
        {footer && (
          <div className="mt-3 text-center text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCard;
