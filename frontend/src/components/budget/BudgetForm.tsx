"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, BudgetFormData } from "@/lib/validations/budgetSchema";
import { setBudget } from "@/lib/api/budget";
import { getCategories } from "@/lib/api/categories";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { toast } from "sonner";
import { X, Target, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants } from "@/lib/animations/variants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BudgetForm({ isOpen, onClose, onSuccess }: Props) {
  const { currency } = useCurrency();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: "monthly",
      amount_limit: undefined,
      category_id: null,
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    try {
      await setBudget({
        period: data.period,
        amount_limit: Number(data.amount_limit),
        category_id: data.category_id ? Number(data.category_id) : undefined,
      });
      toast.success("Budget goal updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to set budget goal");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-gray-800 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.15)] z-10 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-extrabold text-white">Set Budget Target</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Period *
              </label>
              <select
                {...register("period")}
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="monthly">Monthly Spending Target</option>
                <option value="weekly">Weekly Spending Target</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Spending Limit ({currency.symbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-purple-400 text-sm">
                  {currency.symbol}
                </span>
                <input
                  {...register("amount_limit", { valueAsNumber: true })}
                  type="number"
                  step="100"
                  placeholder="e.g. 25000"
                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 pl-8 pr-3.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono font-bold transition-colors"
                />
              </div>
              {errors.amount_limit && (
                <p className="text-xs text-red-400 mt-1">{errors.amount_limit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Category Scope (Optional)
              </label>
              <select
                {...register("category_id")}
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">Overall Account Budget (All Categories)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    Category: {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
              >
                {isSubmitting ? "Saving..." : "Save Budget Target"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
