"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseFormData } from "@/lib/validations/expenseSchema";
import { createExpense, updateExpense } from "@/lib/api/expenses";
import { getCategories, createCategory } from "@/lib/api/categories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/types/expense";
import { toast } from "sonner";
import { X, Plus, Check } from "lucide-react";
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
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
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

  // If categories load asynchronously after modal opens and no category is selected yet, set default category_id
  useEffect(() => {
    if (isOpen && !expenseToEdit && categories.length > 0 && !currentCategoryId) {
      setValue("category_id", String(categories[0].id) as any, { shouldValidate: true });
    }
  }, [isOpen, expenseToEdit, categories, currentCategoryId, setValue]);

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
        toast.success("Expense logged successfully!");
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg glass-panel p-6 rounded-2xl border border-gray-800 shadow-2xl z-10 overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white tracking-wide">
              {isEdit ? "Edit Expense" : "Log New Expense"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Title *</label>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g. Grocery shopping, Electricity bill"
                className="w-full bg-surface border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
            </div>

            {/* Amount & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Amount (₹) *</label>
                <input
                  {...register("amount")}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-surface border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Date *</label>
                <input
                  {...register("date")}
                  type="date"
                  className="w-full bg-surface border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>}
              </div>
            </div>

            {/* Category & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-gray-400">Category *</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
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
                      className="flex-1 bg-surface border border-emerald-500/80 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      disabled={isCreatingCat}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <select
                    {...register("category_id")}
                    className="w-full bg-surface border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Payment Mode</label>
                <select
                  {...register("payment_mode")}
                  className="w-full bg-surface border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
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
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Notes (Optional)</label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Additional details..."
                className="w-full bg-surface border border-gray-700/80 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-glow transition-all"
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
