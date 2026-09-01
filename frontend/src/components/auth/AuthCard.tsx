"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, ShieldCheck } from "lucide-react";
import Link from "next/link";

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
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#070b14] relative overflow-hidden">
      {/* Dynamic ambient gradient orbs */}
      <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle grid texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`w-full ${maxWidthClass} bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/60 p-6 sm:p-8 z-10 relative overflow-hidden`}
      >
        {/* Top subtle highlight border */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="flex items-center gap-2.5 mb-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight block leading-tight">
                Kharcha<span className="text-emerald-400">Pani</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block">
                Expense Tracker
              </span>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">{subtitle}</p>
        </div>

        {/* Card Body */}
        <div className="space-y-4">{children}</div>

        {/* Security badge note */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/70" />
          <span>100% Private & Zero-Trust Multi-Tenant Isolation</span>
        </div>

        {/* Card Footer */}
        {footer && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs sm:text-sm">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};
