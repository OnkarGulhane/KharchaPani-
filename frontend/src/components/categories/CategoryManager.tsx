"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, createCategory, deleteCategory } from "@/lib/api/categories";
import { Category } from "@/types/category";
import CategoryDeleteDialog from "./CategoryDeleteDialog";
import { toast } from "sonner";
import { X, Plus, Trash2, Tag, ShieldAlert } from "lucide-react";
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

  const handleDelete = async (category: Category) => {
    try {
      const res = await deleteCategory(category.id);
      if (res.success) {
        toast.success(`Category "${category.name}" deleted.`);
        refetch();
        onSuccess();
      } else if (res.conflict) {
        setDeleteConflictState({
          category,
          linkedCount: res.conflict.linked_expense_count,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
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
          className="relative w-full max-w-lg glass-panel p-6 rounded-2xl border border-gray-800 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Manage Categories</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleCreate} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New Category Name (e.g. Shopping, Health)"
              className="flex-1 bg-surface border border-gray-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-glow flex items-center gap-1.5"
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
                className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-gray-800/80 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-sm text-white">{cat.name}</span>
                  {cat.is_default && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                      Default
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
              className="px-4 py-2 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white rounded-xl"
            >
              Done
            </button>
          </div>
        </motion.div>

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
