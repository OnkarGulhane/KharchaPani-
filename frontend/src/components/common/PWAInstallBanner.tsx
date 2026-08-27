"use client";

import React from "react";
import { usePWA } from "@/hooks/usePWA";
import { Download, X, Smartphone, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallBanner() {
  const { isInstalled, promptInstall, isBannerDismissed, dismissBanner } = usePWA();

  // If already running as standalone app or dismissed for this view
  if (isInstalled || isBannerDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
      >
        <div className="glass-panel bg-surface/95 border border-emerald-500/35 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-emerald-950/50 relative overflow-hidden backdrop-blur-xl">
          {/* Subtle background glow */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start gap-3 relative z-10">
            {/* App Icon */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  मोबाईल ॲप इन्स्टॉल करा
                </h4>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> PWA
                </span>
              </div>
              <p className="text-xs text-gray-300">
                ब्राउझरशिवाय डायरेक्ट फोनच्या स्क्रीनवरून ॲपसारखे वापरा.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => promptInstall()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>

                <button
                  onClick={dismissBanner}
                  className="px-2.5 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
                >
                  नंतर
                </button>
              </div>
            </div>

            {/* Dismiss X */}
            <button
              onClick={dismissBanner}
              className="absolute top-0 right-0 p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
