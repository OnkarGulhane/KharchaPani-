"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, KeyRound, Wallet, LogOut } from "lucide-react";
import { removeAppKey } from "@/lib/api/client";

export default function Sidebar() {
  const pathname = usePathname();

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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 glass-panel border-r border-gray-800 p-5 select-none z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-glow">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide">Kharcha Pani</h1>
          <p className="text-xs text-gray-400">Expense Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
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
      </nav>

      {/* Footer Info / Key Reset */}
      <div className="pt-4 border-t border-gray-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Reset Access Key</span>
        </button>
      </div>
    </aside>
  );
}
