"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Wallet, LogOut, Download, ShieldAlert } from "lucide-react";
import CurrencySelector from "@/components/common/CurrencySelector";
import ThemeToggle from "@/components/common/ThemeToggle";
import { usePWA } from "@/hooks/usePWA";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isInstalled, promptInstall } = usePWA();
  const { user, logout, logoutAll } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Expenses & Categories", href: "/expenses", icon: Receipt },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 glass-panel border-r border-gray-800 p-5 select-none z-30 justify-between">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-glow shadow-emerald-500/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide">Kharcha Pani</h1>
            <p className="text-xs text-gray-400">Personal Expense Tracker</p>
          </div>
        </div>

        {/* User Badge */}
        {user && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow">
              {user.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white dark:text-white light:text-slate-900 truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Currency & Theme Controls */}
        <div className="mb-4 space-y-3 px-1">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 light:text-slate-500 mb-1 px-1">
              Display Currency
            </label>
            <CurrencySelector className="w-full" />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 light:text-slate-500 mb-1 px-1">
              Theme Mode
            </label>
            <ThemeToggle variant="segmented" className="w-full justify-between" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {!isInstalled && (
            <button
              onClick={() => promptInstall()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all duration-200 mt-3"
            >
              <Download className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Install App</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer Info / Logout */}
      <div className="pt-4 border-t border-gray-800/80 space-y-1">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <button
          onClick={() => logoutAll()}
          title="Revoke sessions on all logged-in devices"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors duration-200"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Sign Out All Devices</span>
        </button>
      </div>
    </aside>
  );
}
