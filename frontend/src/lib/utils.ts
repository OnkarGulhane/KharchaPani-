import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number | string | undefined | null,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    symbol?: string;
    locale?: string;
  }
): string {
  if (value === undefined || value === null) {
    return "0.00";
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) {
    return "0.00";
  }
  const maxDigits = options?.maximumFractionDigits ?? 2;
  const minDigits = Math.min(options?.minimumFractionDigits ?? 2, maxDigits);
  const locale = options?.locale ?? "en-IN";

  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  return options?.symbol ? `${options.symbol}${formatted}` : formatted;
}

export function formatNumber(
  value: number | string | undefined | null,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  if (value === undefined || value === null) {
    return "0";
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) {
    return "0";
  }
  const maxDigits = options?.maximumFractionDigits ?? 2;
  const minDigits = Math.min(options?.minimumFractionDigits ?? 0, maxDigits);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });
}
