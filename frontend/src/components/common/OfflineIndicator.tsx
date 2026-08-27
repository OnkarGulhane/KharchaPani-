"use client";

import React, { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline) {
      // Show brief 'Back Online' badge when switching from offline to online
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-amber-500/90 text-gray-950 font-medium text-xs shadow-lg backdrop-blur-md flex items-center gap-2 border border-amber-300/40 select-none"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Viewing cached data</span>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-emerald-500/90 text-white font-medium text-xs shadow-lg backdrop-blur-md flex items-center gap-2 border border-emerald-300/40 select-none"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Back Online</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
