"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Receipt, KeyRound, Wallet, LogOut, Download, Sparkles } from "lucide-react";
import { removeAppKey } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import CurrencySelector from "@/components/common/CurrencySelector";
import { usePWA } from "@/hooks/usePWA";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="md:hidden">
      {/* Top Mobile Bar */}
      <header className="flex items-center justify-between px-3.5 py-2.5 glass-panel sticky top-0 z-40 border-b border-gray-800 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white">Kharcha Pani</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Install Pill Badge in Top Bar */}
          {!isInstalled && (
            <button
              onClick={() => promptInstall()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 active:scale-95 transition-all shadow-sm"
              title="Install App on Phone"
            >
              <Download className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Install</span>
            </button>
          )}

          <CurrencySelector compact />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface border-r border-gray-800 z-50 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-base text-white">Kharcha Pani</span>
                      <p className="text-[10px] text-emerald-400 font-medium">Expense Tracker</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                    Display Currency
                  </label>
                  <CurrencySelector className="w-full" />
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  {!isInstalled && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        promptInstall();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all mt-3 shadow-md shadow-emerald-950/40"
                    >
                      <Download className="w-5 h-5 text-emerald-400 animate-bounce" />
                      <span>Install Mobile App</span>
                    </button>
                  )}
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Reset Access Key</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
