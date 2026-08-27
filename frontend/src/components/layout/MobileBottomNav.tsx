"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, KeyRound, Plus, Download } from "lucide-react";
import { motion } from "framer-motion";
import { usePWA } from "@/hooks/usePWA";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isInstalled, isInstallable, promptInstall } = usePWA();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Expenses", href: "/expenses", icon: Receipt },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 bg-surface/90 backdrop-blur-xl border-t border-gray-800/80 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard Link */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive ? "text-emerald-400 font-semibold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileTab"
                  className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 mb-0.5 relative z-10 ${isActive ? "text-emerald-400" : ""}`} />
              <span className="text-[11px] relative z-10">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Quick Action (+ Expense) */}
        <Link
          href="/expenses"
          className="relative -top-3 flex flex-col items-center group"
          aria-label="Add Expense"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white active:scale-95 transition-transform duration-150 border-2 border-background">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-medium text-emerald-400 mt-0.5">Quick Add</span>
        </Link>

        {/* Access Key */}
        <Link
          href="/access"
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            pathname === "/access" ? "text-emerald-400 font-semibold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {pathname === "/access" && (
            <motion.div
              layoutId="activeMobileTab"
              className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <KeyRound className="w-5 h-5 mb-0.5 relative z-10" />
          <span className="text-[11px] relative z-10">Access</span>
        </Link>

        {/* Install Button (Only if not already installed as standalone app) */}
        {!isInstalled && (
          <button
            onClick={() => promptInstall()}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Install App"
          >
            <div className="relative">
              <Download className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-semibold">Install</span>
          </button>
        )}
      </div>
    </nav>
  );
}
