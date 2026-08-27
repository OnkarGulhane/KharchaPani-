"use client";

import React from "react";
import { usePWA } from "@/hooks/usePWA";
import { RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAUpdateBanner() {
  const { isUpdateAvailable, applyUpdate } = usePWA();

  if (!isUpdateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 max-w-sm"
      >
        <div className="glass-panel bg-surface/95 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">App Update Available</p>
              <p className="text-[11px] text-gray-300">New features and improvements ready.</p>
            </div>
          </div>
          <button
            onClick={applyUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
