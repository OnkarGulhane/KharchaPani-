"use client";

import React, { useState } from "react";
import { Category } from "@/types/category";
import { deleteCategory } from "@/lib/api/categories";
import { toast } from "sonner";
import { AlertTriangle, Trash2, ArrowRightLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants } from "@/lib/animations/variants";

interface Props {
  isOpen: boolean;
  category: Category;
  allCategories: Category[];
  linkedCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryDeleteDialog({
  isOpen,
  category,
  allCategories,
  linkedCount,
  onClose,
  onSuccess,
}: Props) {
  const [reassignTargetId, setReassignTargetId] = useState<number | undefined>(
    allCategories.find((c) => c.id !== category.id)?.id
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTargetCategories = allCategories.filter((c) => c.id !== category.id);

  const handleReassignAndDelete = async () => {
    if (!reassignTargetId) {
      toast.error("Please select a category to reassign expenses to");
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteCategory(category.id, { reassign_to: reassignTargetId });
      toast.success(`Expenses reassigned and category "${category.name}" deleted.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCascadeDelete = async () => {
    if (!confirm(`Are you sure you want to delete category "${category.name}" AND all ${linkedCount} linked expenses? This action cannot be undone.`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteCategory(category.id, { cascade: true });
      toast.success(`Category "${category.name}" and ${linkedCount} expenses deleted.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg glass-panel p-6 rounded-2xl border border-amber-500/30 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Cannot Delete Immediately</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Category <strong className="text-amber-400 font-semibold">{category.name}</strong> has{" "}
            <strong className="text-white font-bold">{linkedCount}</strong> linked expense(s). Please choose how to handle linked expenses:
          </p>

          <div className="space-y-4">
            {/* Option 1: Reassign */}
            <div className="p-4 rounded-xl bg-surface border border-gray-700/80 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Option 1: Reassign Expenses (Recommended)</span>
              </div>
              <p className="text-xs text-gray-400">
                Move all {linkedCount} expense(s) to another category before deleting.
              </p>

              {availableTargetCategories.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    value={reassignTargetId || ""}
                    onChange={(e) => setReassignTargetId(Number(e.target.value))}
                    className="flex-1 bg-card border border-gray-600 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {availableTargetCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleReassignAndDelete}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm whitespace-nowrap"
                  >
                    Reassign & Delete
                  </button>
                </div>
              ) : (
                <p className="text-xs text-red-400">No other category available for reassignment.</p>
              )}
            </div>

            {/* Option 2: Cascade */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                <Trash2 className="w-4 h-4" />
                <span>Option 2: Delete Category & All Expenses</span>
              </div>
              <p className="text-xs text-gray-400">
                Permanently delete category "{category.name}" and all {linkedCount} linked expenses.
              </p>
              <button
                onClick={handleCascadeDelete}
                disabled={isSubmitting}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold text-xs rounded-lg border border-red-500/30 transition-colors"
              >
                Cascade Delete All ({linkedCount} Expenses)
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
