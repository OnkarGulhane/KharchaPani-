"use client";

import React from "react";
import { Category } from "@/types/category";
import { ExpenseFilterParams } from "@/types/expense";
import { Search, Filter, Calendar, ArrowUpDown, X } from "lucide-react";

interface Props {
  filters: ExpenseFilterParams;
  categories: Category[];
  onChange: (filters: ExpenseFilterParams) => void;
  onReset: () => void;
}

export default function ExpenseFilters({ filters, categories, onChange, onReset }: Props) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onChange({ ...filters, category_id: val, page: 1 });
  };

  const handlePaymentModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || undefined;
    onChange({ ...filters, payment_mode: val, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort_by, order] = e.target.value.split(":");
    onChange({ ...filters, sort_by, order: order as "asc" | "desc", page: 1 });
  };

  const handleStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, start_date: e.target.value || undefined, page: 1 });
  };

  const handleEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, end_date: e.target.value || undefined, page: 1 });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category_id ||
    filters.start_date ||
    filters.end_date ||
    filters.payment_mode ||
    filters.sort_by !== "date" ||
    filters.order !== "desc";

  return (
    <div className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-4 mb-6">
      {/* Top Search & Reset Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={handleSearchChange}
            placeholder="Search by title, notes..."
            className="w-full bg-surface border border-gray-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors self-end sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Multi-Filter Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 pt-3 border-t border-gray-800/60">
        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Category</label>
          <select
            value={filters.category_id || ""}
            onChange={handleCategoryChange}
            className="w-full bg-surface border border-gray-700 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Payment Mode</label>
          <select
            value={filters.payment_mode || ""}
            onChange={handlePaymentModeChange}
            className="w-full bg-surface border border-gray-700 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Modes</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="NetBanking">NetBanking</option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">From Date</label>
          <input
            type="date"
            value={filters.start_date || ""}
            onChange={handleStartDate}
            className="w-full bg-surface border border-gray-700 rounded-xl py-2 px-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">To Date</label>
          <input
            type="date"
            value={filters.end_date || ""}
            onChange={handleEndDate}
            className="w-full bg-surface border border-gray-700 rounded-xl py-2 px-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Sort */}
        <div className="xs:col-span-2 sm:col-span-1">
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Sort By</label>
          <select
            value={`${filters.sort_by || "date"}:${filters.order || "desc"}`}
            onChange={handleSortChange}
            className="w-full bg-surface border border-gray-700 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="date:desc">Newest First</option>
            <option value="date:asc">Oldest First</option>
            <option value="amount:desc">Highest Amount</option>
            <option value="amount:asc">Lowest Amount</option>
            <option value="title:asc">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
