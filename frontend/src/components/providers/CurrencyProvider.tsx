"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", locale: "en-IN" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", locale: "en-GB" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", locale: "ar-AE" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", locale: "ja-JP" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦", locale: "en-CA" },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar", flag: "🇦🇺", locale: "en-AU" },
];

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrencyByCode: (code: string) => void;
  formatAmount: (
    value: number | string | undefined | null,
    options?: { minimumFractionDigits?: number; maximumFractionDigits?: number; includeSymbol?: boolean }
  ) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "kharcha_pani_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedCode = localStorage.getItem(STORAGE_KEY);
      if (savedCode) {
        const found = SUPPORTED_CURRENCIES.find((c) => c.code === savedCode);
        if (found) setCurrency(found);
      }
    } catch {
      // localStorage may not be available in SSR or restricted environments
    }
    setMounted(true);
  }, []);

  const setCurrencyByCode = (code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
      try {
        localStorage.setItem(STORAGE_KEY, found.code);
      } catch {
        // ignore storage error
      }
    }
  };

  const formatAmount = (
    value: number | string | undefined | null,
    options?: { minimumFractionDigits?: number; maximumFractionDigits?: number; includeSymbol?: boolean }
  ): string => {
    if (value === undefined || value === null) {
      return options?.includeSymbol !== false ? `${currency.symbol}0.00` : "0.00";
    }
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) {
      return options?.includeSymbol !== false ? `${currency.symbol}0.00` : "0.00";
    }

    const maxDigits = options?.maximumFractionDigits ?? (currency.code === "JPY" ? 0 : 2);
    const minDigits = Math.min(options?.minimumFractionDigits ?? (currency.code === "JPY" ? 0 : 2), maxDigits);

    const formattedNumber = num.toLocaleString(currency.locale, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });

    return options?.includeSymbol !== false
      ? `${currency.symbol}${formattedNumber}`
      : formattedNumber;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyByCode, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider
    const defaultCurrency = SUPPORTED_CURRENCIES[0];
    return {
      currency: defaultCurrency,
      setCurrencyByCode: () => {},
      formatAmount: (
        value: number | string | undefined | null,
        options?: { minimumFractionDigits?: number; maximumFractionDigits?: number; includeSymbol?: boolean }
      ) => {
        if (value === undefined || value === null) return "₹0.00";
        const num = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(num)) return "₹0.00";
        const maxDigits = options?.maximumFractionDigits ?? 2;
        const minDigits = Math.min(options?.minimumFractionDigits ?? 2, maxDigits);
        const formatted = num.toLocaleString("en-IN", {
          minimumFractionDigits: minDigits,
          maximumFractionDigits: maxDigits,
        });
        return options?.includeSymbol !== false ? `₹${formatted}` : formatted;
      },
    };
  }
  return context;
}
