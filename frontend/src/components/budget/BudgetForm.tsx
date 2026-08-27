"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, BudgetFormData } from "@/lib/validations/budgetSchema";
import { setBudget } from "@/lib/api/budget";
import { getCategories } from "@/lib/api/categories";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants } from "@/lib/animations/variants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BudgetForm({ isOpen, onClose, onSuccess }: Props) {
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-gray-800 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Set Budget Goal</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Period *</label>
              <select
                {...register("period")}
                className="w-full bg-surface border border-gray-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">Monthly Goal</option>
                <option value="weekly">Weekly Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Limit Amount (₹) *
              </label>
              <input
                {...register("amount_limit", { valueAsNumber: true })}
                type="number"
                step="100"
                placeholder="e.g. 25000"
                className="w-full bg-surface border border-gray-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              {errors.amount_limit && (
                <p className="text-xs text-red-400 mt-1">{errors.amount_limit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Scope (Optional)
              </label>
              <select
                {...register("category_id")}
                className="w-full bg-surface border border-gray-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Overall Total Spend</option>
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
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-glow transition-all"
              >
                {isSubmitting ? "Saving..." : "Save Budget Goal"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
