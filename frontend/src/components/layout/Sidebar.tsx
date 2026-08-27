"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, KeyRound, Wallet, LogOut, Download } from "lucide-react";
import { removeAppKey } from "@/lib/api/client";
import CurrencySelector from "@/components/common/CurrencySelector";
import { usePWA } from "@/hooks/usePWA";

export default function Sidebar() {
  const pathname = usePathname();
  const { isInstalled, promptInstall } = usePWA();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Expenses & Categories", href: "/expenses", icon: Receipt },
    { name: "Access Key", href: "/access", icon: KeyRound },
  ];

  const handleLogout = () => {
    removeAppKey();
    window.location.href = "/access";
  };

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
            <p className="text-xs text-gray-400">Expense Tracker</p>
          </div>
        </div>

        {/* Currency Switcher in Sidebar */}
        <div className="mb-5 px-1">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5 px-1">
            Display Currency
          </label>
          <CurrencySelector className="w-full" />
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

      {/* Footer Info / Key Reset */}
      <div className="pt-4 border-t border-gray-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Reset Access Key</span>
        </button>
      </div>
    </aside>
  );
}
