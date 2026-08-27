"use client";

import React, { useState, useEffect } from "react";
import { CategoryPieItem } from "@/types/dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: CategoryPieItem[];
  loading: boolean;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function CategoryPieChart({ data, loading }: Props) {
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
        <p className="text-sm font-semibold text-gray-400">No Category Breakdown Available</p>
        <p className="text-xs text-gray-500 mt-1">Log expenses to see spending distribution.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
      <h3 className="text-sm font-bold text-white mb-4">Spend by Category</h3>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category_name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryPieItem;
                  return (
                    <div className="bg-surface/90 backdrop-blur-md border border-gray-700 p-2.5 rounded-xl shadow-lg text-xs">
                      <p className="font-semibold text-white">{item.category_name}</p>
                      <p className="text-emerald-400 font-bold">₹{formatCurrency(item.amount)}</p>
                      <p className="text-gray-400">{item.percentage}% of total</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-800/60 max-h-24 overflow-y-auto">
        {data.map((item, idx) => (
          <div key={item.category_id} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-gray-300 truncate">{item.category_name}</span>
            <span className="text-gray-500 font-mono ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
