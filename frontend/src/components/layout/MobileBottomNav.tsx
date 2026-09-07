"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Sparkles, Mic, Download, Plus, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { usePWA } from "@/hooks/usePWA";
import { useQueryClient } from "@tanstack/react-query";
import { VoiceExpenseModal } from "@/components/expenses/VoiceExpenseModal";
import QuickAddModal from "@/components/expenses/QuickAddModal";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { openKharchaGuru } from "@/lib/api/ai";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isInstalled, promptInstall } = usePWA();

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseInitialData, setExpenseInitialData] = useState<any>(null);

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-top-categories"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-average-spend"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-comparison"] });
    queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
  };

  const isDashboard = pathname === "/";
  const isExpenses = pathname === "/expenses";

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-1.5 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-1.5 bg-[#0b1120]/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Dashboard Link */}
          <Link
            href="/"
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
              isDashboard ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {isDashboard && (
              <motion.div
                layoutId="activeMobileTab"
                className="absolute inset-0 bg-emerald-500/15 rounded-xl border border-emerald-500/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <LayoutDashboard className={`w-5 h-5 mb-0.5 relative z-10 ${isDashboard ? "text-emerald-400" : ""}`} />
            <span className="text-[10px] relative z-10">Dashboard</span>
          </Link>

          {/* Expenses Link */}
          <Link
            href="/expenses"
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
              isExpenses ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {isExpenses && (
              <motion.div
                layoutId="activeMobileTab"
                className="absolute inset-0 bg-emerald-500/15 rounded-xl border border-emerald-500/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Receipt className={`w-5 h-5 mb-0.5 relative z-10 ${isExpenses ? "text-emerald-400" : ""}`} />
            <span className="text-[10px] relative z-10">Expenses</span>
          </Link>

          {/* Center Floating Action: बोली खर्चा (Voice AI) */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
            aria-label="बोली खर्चा - Voice AI Expense"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-70 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse" />
              <div className="relative w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-xl shadow-amber-500/30 text-white active:scale-90 transition-transform duration-150 border-2 border-[#0b1120]">
                <Mic className="w-6 h-6 animate-pulse stroke-[2.5]" />
              </div>
            </div>
            <span className="text-[10px] font-black text-amber-300 mt-0.5 tracking-tight drop-shadow">
              बोली खर्चा
            </span>
          </button>

          {/* Kharcha Guru AI Chatbot Trigger Tab */}
          <button
            onClick={() => openKharchaGuru()}
            className="relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-violet-300 hover:text-violet-100 active:scale-95 transition-all"
            title="Ask Kharcha Guru AI"
          >
            <div className="relative flex items-center justify-center">
              <span className="text-lg mb-0.5 animate-bounce-subtle">🤖</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-400" />
            </div>
            <span className="text-[10px] font-extrabold text-violet-300">खर्चा Guru</span>
          </button>

          {/* AI Quick Add Button */}
          <button
            onClick={() => {
              setExpenseInitialData(null);
              setIsQuickAddModalOpen(true);
            }}
            className="relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-purple-300 hover:text-purple-200 active:scale-95 transition-all"
            title="AI Quick Add"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 mb-0.5 text-purple-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-purple-300">Quick Add</span>
          </button>
        </div>
      </nav>

      {/* Global Mobile Modals triggered from bottom bar */}
      {isVoiceModalOpen && (
        <VoiceExpenseModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onExpenseCreated={handleRefreshAll}
          onOpenFullForm={(parsedData) => {
            setExpenseInitialData(parsedData);
            setIsExpenseFormOpen(true);
          }}
        />
      )}

      {isQuickAddModalOpen && (
        <QuickAddModal
          isOpen={isQuickAddModalOpen}
          onClose={() => setIsQuickAddModalOpen(false)}
          onSuccess={handleRefreshAll}
          onOpenFullFormWithData={(parsedData) => {
            setExpenseInitialData(parsedData);
            setIsExpenseFormOpen(true);
          }}
        />
      )}

      {isExpenseFormOpen && (
        <ExpenseForm
          isOpen={isExpenseFormOpen}
          initialData={expenseInitialData}
          onClose={() => {
            setIsExpenseFormOpen(false);
            setExpenseInitialData(null);
          }}
          onSuccess={handleRefreshAll}
        />
      )}
    </>
  );
}
