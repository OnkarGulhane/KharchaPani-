"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, createCategory, deleteCategory } from "@/lib/api/categories";
import { Category } from "@/types/category";
import CategoryDeleteDialog from "./CategoryDeleteDialog";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { toast } from "sonner";
import { X, Plus, Trash2, Tag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants } from "@/lib/animations/variants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryManager({ isOpen, onClose, onSuccess }: Props) {
  const [newCatName, setNewCatName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);
  const [deleteConflictState, setDeleteConflictState] = useState<{
    category: Category;
    linkedCount: number;
  } | null>(null);

  const { data: categories = [], refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    setIsCreating(true);
    try {
      await createCategory({ name: newCatName.trim() });
      toast.success(`Category "${newCatName.trim()}" created!`);
      setNewCatName("");
      refetch();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCat(true);
    try {
      const res = await deleteCategory(categoryToDelete.id);
      if (res.success) {
        toast.success(`Category "${categoryToDelete.name}" deleted.`);
        setCategoryToDelete(null);
        refetch();
        onSuccess();
      } else if (res.conflict) {
        const cat = categoryToDelete;
        setCategoryToDelete(null);
        setDeleteConflictState({
          category: cat,
          linkedCount: res.conflict.linked_expense_count,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setIsDeletingCat(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
          className="relative w-full max-w-lg glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-800 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] z-10 max-h-[90dvh] overflow-y-auto overscroll-contain"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-extrabold text-white">Manage Categories</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleCreate} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New Category Name (e.g. Shopping, Fitness)"
              className="flex-1 bg-gray-900/80 border border-gray-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Category List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-white">{cat.name}</span>
                  {cat.is_default && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
                      Default
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all active:scale-95"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold bg-gray-800 hover:bg-gray-700 text-white rounded-xl active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>

        {/* 3D Delete Confirmation Dialog */}
        {categoryToDelete && (
          <ConfirmDeleteModal
            isOpen={!!categoryToDelete}
            title={`Delete "${categoryToDelete.name}" Category?`}
            description="Are you sure you want to delete this category? If there are linked expenses, you will be prompted to reassign them."
            itemDetails={`Category: ${categoryToDelete.name}`}
            isDeleting={isDeletingCat}
            onConfirm={handleExecuteDelete}
            onCancel={() => setCategoryToDelete(null)}
          />
        )}

        {/* Delete Conflict Warning Modal */}
        {deleteConflictState && (
          <CategoryDeleteDialog
            isOpen={!!deleteConflictState}
            category={deleteConflictState.category}
            allCategories={categories}
            linkedCount={deleteConflictState.linkedCount}
            onClose={() => setDeleteConflictState(null)}
            onSuccess={() => {
              refetch();
              onSuccess();
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
