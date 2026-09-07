"use client";

import React, { useState } from "react";
import { simulateSavingsGoal } from "@/lib/api/ai";
import { SavingsGoalResponse } from "@/types/ai";
import { toast } from "sonner";

interface SavingsGoalSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavingsGoalSimulator: React.FC<SavingsGoalSimulatorProps> = ({ isOpen, onClose }) => {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState<number>(30000);
  const [targetMonths, setTargetMonths] = useState<number>(6);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SavingsGoalResponse | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) {
      toast.error("Please enter a goal name (e.g. Goa Trip, New Phone, Laptop)");
      return;
    }

    try {
      setIsSimulating(true);
      const res = await simulateSavingsGoal({
        goal_name: goalName.trim(),
        target_amount: targetAmount,
        target_months: targetMonths,
      });
      setResult(res);
      toast.success("Goal plan simulated! ✨");
    } catch (err: any) {
      toast.error(err?.message || "Failed to simulate savings goal");
    } finally {
      setIsSimulating(false);
    }
  };

  const getFeasibilityColor = (status: string) => {
    switch (status) {
      case "Highly Feasible":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Achievable":
      case "Achievable with Focus":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      default:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-theme-surface border border-theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border flex items-center justify-between bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                Goal-Based Savings Simulator
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  AI Planner
                </span>
              </h3>
              <p className="text-xs text-theme-muted">Simulate category spending cuts to achieve future financial goals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-border/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSimulate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1.5">What is your dream goal?</label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro, Goa Vacation, iPhone 16"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-theme-muted">Target Amount</span>
                  <span className="font-bold text-purple-400 font-mono">₹{targetAmount.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-theme-muted">Timeline (Months)</span>
                  <span className="font-bold text-purple-400 font-mono">{targetMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="36"
                  step="1"
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <span>Generating AI Savings Plan...</span>
              ) : (
                <>
                  <span>✨ Calculate AI Budget Cut Plan</span>
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {result && (
            <div className="p-5 rounded-xl bg-theme-card border border-theme-border space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border/50">
                <div>
                  <span className="text-xs text-theme-muted">Target Goal</span>
                  <h4 className="text-lg font-bold text-theme-text">{result.goal_name}</h4>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getFeasibilityColor(result.feasibility_status)}`}>
                  {result.feasibility_status} ({result.feasibility_score}/100)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-theme-muted block">Required / Month</span>
                  <span className="text-sm font-extrabold text-purple-400 font-mono">
                    ₹{Number(result.required_monthly_savings).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-theme-muted block">Discretionary Pool</span>
                  <span className="text-sm font-extrabold text-theme-text font-mono">
                    ₹{Number(result.current_discretionary_spend).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-theme-bg/60 border border-theme-border/40 col-span-2 sm:col-span-1">
                  <span className="text-theme-muted block">Est. Timeline</span>
                  <span className="text-sm font-extrabold text-theme-text font-mono">
                    {result.estimated_completion_months} Months
                  </span>
                </div>
              </div>

              {/* AI Guidance Box */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-theme-text leading-relaxed">
                💡 <strong className="text-purple-300">AI Advisor Strategy:</strong> {result.ai_advice}
              </div>

              {/* Category Cuts */}
              {result.category_cut_plans.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-theme-muted mb-2">Recommended Category Reductions:</h5>
                  <div className="space-y-2">
                    {result.category_cut_plans.map((plan, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-theme-bg/50 border border-theme-border/40 text-xs flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-theme-text">{plan.category_name} (-{plan.cut_percentage}%)</span>
                          <span className="font-mono font-bold text-emerald-400">+₹{Number(plan.monthly_savings).toLocaleString("en-IN")}/mo</span>
                        </div>
                        <p className="text-[11px] text-theme-muted">{plan.action_tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
