"use client";

import React, { useState, useEffect } from "react";
import { SpendTrendItem } from "@/types/dashboard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: SpendTrendItem[];
  loading: boolean;
}

export default function SpendTrendChart({ data, loading }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return <div className="h-64 glass-panel rounded-2xl animate-pulse p-4" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold text-gray-400">No Trend Data</p>
        <p className="text-xs text-gray-500 mt-1">Log expenses over time to view spend trends.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
      <h3 className="text-sm font-bold text-white mb-4">Spending Trend Over Time</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SpendTrendItem;
                  return (
                    <div className="bg-surface/90 backdrop-blur-md border border-gray-700 p-2.5 rounded-xl shadow-lg text-xs">
                      <p className="text-gray-400">{item.label}</p>
                      <p className="text-emerald-400 font-bold text-sm mt-0.5">
                        ₹{formatCurrency(item.amount)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorSpend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
