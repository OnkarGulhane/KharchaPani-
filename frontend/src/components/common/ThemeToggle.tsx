"use client";

import React from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "segmented" | "floating";
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  variant = "icon",
  compact = false,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Floating pill variant (e.g. for Auth cards / Login page corner)
  if (variant === "floating") {
    return (
      <motion.button
        type="button"
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 text-xs font-semibold text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white light:text-slate-700 light:hover:text-slate-950 shadow-lg backdrop-blur-xl transition-colors cursor-pointer select-none ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {resolvedTheme === "dark" ? (
            <motion.div
              key="moon-float"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Night Mode</span>
            </motion.div>
          ) : (
            <motion.div
              key="sun-float"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Day Mode</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Segmented Pill Selector (Dark | Light | Auto)
  if (variant === "segmented") {
    const options: Array<{ id: "dark" | "light" | "system"; label: string; icon: any }> = [
      { id: "dark", label: "Dark", icon: Moon },
      { id: "light", label: "Light", icon: Sun },
      { id: "system", label: "Auto", icon: Laptop },
    ];

    return (
      <div
        className={`inline-flex p-1 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 border border-slate-800 dark:border-slate-800 light:bg-slate-200/90 light:border-slate-300 ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? "text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-bold"
                  : "text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600 light:hover:text-slate-900"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="segmentedThemeIndicator"
                  className="absolute inset-0 bg-slate-800 dark:bg-slate-800 light:bg-white rounded-lg shadow-sm border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Icon Button Switch (Default)
  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Toggle Theme (${resolvedTheme === "dark" ? "Light" : "Dark"})`}
      title={`Switch to ${resolvedTheme === "dark" ? "Light Mode" : "Night Mode"}`}
      className={`relative p-2 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        resolvedTheme === "dark"
          ? "bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 text-indigo-400 hover:shadow-glow shadow-indigo-500/10"
          : "bg-white/90 border-slate-200 hover:border-amber-500/50 text-amber-500 shadow-sm"
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "dark" ? (
          <motion.div
            key="dark-icon"
            initial={{ rotate: -120, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 120, scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex items-center justify-center"
          >
            <Moon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </motion.div>
        ) : (
          <motion.div
            key="light-icon"
            initial={{ rotate: -120, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 120, scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex items-center justify-center"
          >
            <Sun className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
