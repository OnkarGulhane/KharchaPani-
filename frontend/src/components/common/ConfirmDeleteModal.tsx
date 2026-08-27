"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";
import { modalVariants } from "@/lib/animations/variants";

interface Props {
  isOpen: boolean;
  title: string;
  description?: string;
  itemDetails?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  description = "Are you sure you want to delete this entry? This action cannot be reversed.",
  itemDetails,
  isDeleting = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* 3D Glassmorphic Modal Box */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-rose-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(244,63,94,0.2)] z-10 overflow-hidden"
        >
          {/* Ambient red glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start gap-4 mb-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)] flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {itemDetails && (
            <div className="mb-5 p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs font-semibold text-gray-200 font-mono">
              {itemDetails}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800/80">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/60 text-xs font-bold text-gray-300 hover:text-white transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
