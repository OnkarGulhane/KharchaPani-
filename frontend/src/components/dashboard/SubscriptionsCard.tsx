"use client";

import React, { useEffect, useState } from "react";
import { getSubscriptions } from "@/lib/api/ai";
import { SubscriptionsResponse } from "@/types/ai";
import { toast } from "sonner";

export const SubscriptionsCard: React.FC = () => {
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await getSubscriptions();
      setData(res);
    } catch (err: any) {
      // Quiet fail if no data
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-theme-surface/70 border border-theme-border/60 shadow-xl backdrop-blur-md animate-pulse">
        <div className="h-6 w-40 bg-theme-border/50 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-theme-border/30 rounded-xl"></div>
          <div className="h-12 bg-theme-border/30 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data || data.subscriptions.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-2xl bg-theme-surface/80 border border-theme-border/60 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      {/* Background Accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-theme-text flex items-center gap-2">
              Recurring Subscriptions & EMI
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {data.active_subscriptions_count} Active
              </span>
            </h3>
            <p className="text-xs text-theme-muted">AI-detected recurring payments and auto-debits</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-theme-muted block">Monthly Drain</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">
            ₹{Number(data.total_monthly_recurring).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Subscription List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.subscriptions.map((sub, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-theme-card/60 border border-theme-border/50 hover:border-amber-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-theme-bg flex items-center justify-center font-bold text-sm text-theme-text border border-theme-border">
                {sub.merchant_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-theme-text truncate max-w-[140px]">{sub.merchant_name}</h4>
                <span className="text-[10px] text-theme-muted">{sub.category_name} • {sub.frequency}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-theme-text font-mono">
                ₹{Number(sub.amount).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-theme-muted block">
                ₹{Number(sub.annual_cost).toLocaleString("en-IN")}/yr
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
