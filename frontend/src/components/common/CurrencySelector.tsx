"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyInfo } from "@/components/providers/CurrencyProvider";
import { ChevronDown, Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  className?: string;
  compact?: boolean;
}

export default function CurrencySelector({ className = "", compact = false }: Props) {
  const { currency, setCurrencyByCode } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (curr: CurrencyInfo) => {
    setCurrencyByCode(curr.code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/80 hover:bg-gray-800/90 border border-gray-700/80 rounded-xl text-xs font-bold text-gray-200 hover:text-white transition-all shadow-sm active:scale-95 group"
        title="Change Currency"
      >
        <span className="text-sm">{currency.flag}</span>
        <span className="font-mono text-emerald-400 font-extrabold">{currency.symbol}</span>
        {!compact && (
          <span className="text-gray-300 font-semibold text-[11px] hidden sm:inline">
            {currency.code}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 bg-gray-950/95 backdrop-blur-2xl border border-gray-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] z-50 p-1.5 space-y-0.5 overflow-hidden"
          >
            <div className="px-2.5 py-1.5 border-b border-gray-800/80 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Select Active Currency</span>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 pr-0.5">
              {SUPPORTED_CURRENCIES.map((item) => {
                const isSelected = item.code === currency.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.flag}</span>
                      <span className="font-mono text-emerald-400 font-bold">{item.symbol}</span>
                      <span className="truncate">{item.name}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
