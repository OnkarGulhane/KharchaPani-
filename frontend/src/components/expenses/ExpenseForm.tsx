"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseFormData } from "@/lib/validations/expenseSchema";
import { createExpense, updateExpense } from "@/lib/api/expenses";
import { getCategories, createCategory } from "@/lib/api/categories";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/types/expense";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { toast } from "sonner";
import { X, Plus, Check, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants } from "@/lib/animations/variants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: Expense | null;
}

export default function ExpenseForm({ isOpen, onClose, onSuccess, expenseToEdit }: Props) {
  const queryClient = useQueryClient();
  const { currency, formatAmount } = useCurrency();
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary", "month"],
    queryFn: () => getDashboardSummary("month"),
    staleTime: 60000,
  });

  const isEdit = !!expenseToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
      category_id: undefined,
      notes: "",
      payment_mode: "UPI",
    },
  });

  const currentCategoryId = watch("category_id");
  const enteredAmount = watch("amount");

  // Initialize form default values when modal opens or expenseToEdit changes
  useEffect(() => {
    if (isOpen) {
      const catId = expenseToEdit
        ? String(expenseToEdit.category_id)
        : categories.length > 0
        ? String(categories[0].id)
        : "";

      reset({
        title: expenseToEdit?.title || "",
        amount: expenseToEdit?.amount,
        date: expenseToEdit?.date || new Date().toISOString().split("T")[0],
        category_id: catId as any,
        notes: expenseToEdit?.notes || "",
        payment_mode: expenseToEdit?.payment_mode || "UPI",
      });
    }
  }, [isOpen, expenseToEdit, reset]);

  // Set default category if not selected
  useEffect(() => {
    if (isOpen && !expenseToEdit && categories.length > 0 && !currentCategoryId) {
      setValue("category_id", String(categories[0].id) as any, { shouldValidate: true });
    }
  }, [isOpen, expenseToEdit, categories, currentCategoryId, setValue]);

  // Live Budget Exceed Warning Calculation
  const budgetStatus = summary?.budget_status;
  const numEntered = Number(enteredAmount) || 0;
  const originalAmount = expenseToEdit ? Number(expenseToEdit.amount) || 0 : 0;
  const netAdded = numEntered - originalAmount;

  let willExceedBudget = false;
  let exceedAmount = 0;
  let isNearLimitWarning = false;

  if (budgetStatus && budgetStatus.amount_limit && budgetStatus.amount_limit > 0 && numEntered > 0) {
    const projectedTotal = (budgetStatus.total_spent || 0) + netAdded;
    if (projectedTotal > budgetStatus.amount_limit) {
      willExceedBudget = true;
      exceedAmount = projectedTotal - budgetStatus.amount_limit;
    } else if (projectedTotal >= budgetStatus.amount_limit * 0.8) {
      isNearLimitWarning = true;
    }
  }

  // Handle Quick Add Category
  const handleQuickAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    setIsCreatingCat(true);
    try {
      const created = await createCategory({ name: newCategoryName.trim() });
      toast.success(`Category "${created.name}" created!`);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setValue("category_id", String(created.id) as any, { shouldValidate: true });
      setNewCategoryName("");
      setIsAddingNewCat(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setIsCreatingCat(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const payload = {
        title: data.title,
        amount: Number(data.amount),
        date: data.date,
        category_id: Number(data.category_id),
        notes: data.notes || null,
        payment_mode: data.payment_mode || "UPI",
      };

      if (isEdit && expenseToEdit) {
        await updateExpense(expenseToEdit.id, payload as any);
        toast.success("Expense updated successfully!");
      } else {
        await createExpense(payload as any);
        if (willExceedBudget) {
          toast.warning(`Expense logged! ⚠️ Caution: Monthly budget exceeded by ${formatAmount(exceedAmount)}!`);
        } else {
          toast.success("Expense logged successfully!");
        }
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save expense");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg glass-panel p-6 rounded-3xl border border-gray-800/90 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] z-10 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-800">
            <h3 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{isEdit ? "Edit Expense" : "Log New Expense"}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Title *
              </label>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g. Grocery shopping, Electricity bill, Coffee"
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
            </div>

            {/* Amount & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Amount ({currency.symbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-emerald-400 text-sm">
                    {currency.symbol}
                  </span>
                  <input
                    {...register("amount")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 pl-8 pr-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono font-bold transition-colors"
                  />
                </div>
                {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Date *
                </label>
                <input
                  {...register("date")}
                  type="date"
                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>}
              </div>
            </div>

            {/* Live Budget Exceed Alert in Form */}
            {willExceedBudget && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-rose-200">Budget Limit Warning!</p>
                  <p className="text-[11px] text-rose-300/90 mt-0.5 leading-relaxed">
                    Logging this amount will exceed your monthly budget cap by{" "}
                    <span className="font-extrabold font-mono text-white">
                      {formatAmount(exceedAmount)}
                    </span>
                    .
                  </p>
                </div>
              </motion.div>
            )}

            {isNearLimitWarning && !willExceedBudget && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-amber-200">Approaching Budget Cap</p>
                  <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                    This transaction will utilize ≥80% of your current monthly budget.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Category & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingNewCat ? "Cancel" : "New"}</span>
                  </button>
                </div>

                {isAddingNewCat ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category Name"
                      className="flex-1 bg-gray-900 border border-emerald-500/80 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      disabled={isCreatingCat}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <select
                    {...register("category_id")}
                    className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}

                {errors.category_id && (
                  <p className="text-xs text-red-400 mt-1">
                    {isAddingNewCat
                      ? "Please click the checkmark button (✓) to save your new category"
                      : errors.category_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Payment Mode
                </label>
                <select
                  {...register("payment_mode")}
                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Notes (Optional)
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Additional details, store name, or receipt notes..."
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {isSubmitting ? "Saving..." : isEdit ? "Update Expense" : "Log Expense"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
