"use client";

import React, { useState, useRef } from "react";
import { scanReceipt } from "@/lib/api/ai";
import { ReceiptScanResponse } from "@/types/ai";
import { toast } from "sonner";

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
  onPreFillExpense?: (data: {
    title: string;
    amount: number;
    date: string;
    category_id: number;
    payment_mode?: string;
    notes?: string;
  }) => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({
  isOpen,
  onClose,
  onExpenseCreated,
  onPreFillExpense,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ReceiptScanResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setScannedData(null);

      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error("Please select or capture a receipt image first");
      return;
    }

    try {
      setIsScanning(true);
      const result = await scanReceipt(selectedFile);
      setScannedData(result);
      toast.success("Receipt scanned successfully! ✨");
    } catch (err: any) {
      toast.error(err?.message || "Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveInstant = async () => {
    if (!scannedData) return;
    try {
      setIsSaving(true);
      const { createExpense } = await import("@/lib/api/expenses");
      await createExpense({
        title: scannedData.merchant_name,
        amount: scannedData.amount,
        date: scannedData.date,
        category_id: scannedData.category_id,
        payment_mode: scannedData.payment_mode || "Card",
        notes: scannedData.notes || `Scanned Receipt (${scannedData.engine_used})`,
      });
      toast.success("Expense logged from receipt! 🎉");
      onExpenseCreated();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInForm = () => {
    if (!scannedData) return;
    if (onPreFillExpense) {
      onPreFillExpense({
        title: scannedData.merchant_name,
        amount: scannedData.amount,
        date: scannedData.date,
        category_id: scannedData.category_id,
        payment_mode: scannedData.payment_mode,
        notes: scannedData.notes,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-theme-surface border border-theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                Smart Receipt & Bill Scanner
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Vision AI
                </span>
              </h3>
              <p className="text-xs text-theme-muted">Upload or capture any receipt, invoice, or D-Mart bill</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-border/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              selectedFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-theme-border hover:border-emerald-500/40 hover:bg-theme-card/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-48 rounded-lg shadow-md border border-theme-border object-contain"
                />
                <p className="text-xs text-theme-muted">{selectedFile?.name} (Click to change)</p>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">📄</div>
                <p className="text-sm font-medium text-theme-text">{selectedFile.name}</p>
                <p className="text-xs text-theme-muted">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="p-4 bg-theme-border/30 rounded-full text-theme-muted">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-theme-text">Click or drag receipt image / PDF here</p>
                <p className="text-xs text-theme-muted">Supports JPEG, PNG, WebP, PDF (Max 10MB)</p>
              </div>
            )}
          </div>

          {/* Scan Action Button */}
          {selectedFile && !scannedData && (
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>AI Scanning Receipt...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Extract Receipt Details with AI</span>
                </>
              )}
            </button>
          )}

          {/* Scanned Data Output */}
          {scannedData && (
            <div className="p-4 rounded-xl bg-theme-card border border-theme-border/60 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border/40">
                <div>
                  <span className="text-xs text-theme-muted">Merchant</span>
                  <h4 className="text-base font-bold text-theme-text">{scannedData.merchant_name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-theme-muted">Total Amount</span>
                  <h4 className="text-xl font-extrabold text-emerald-400">₹{Number(scannedData.amount).toLocaleString("en-IN")}</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-theme-muted block">Category</span>
                  <span className="font-semibold text-theme-text">{scannedData.category_name}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-theme-muted block">Date</span>
                  <span className="font-semibold text-theme-text">{scannedData.date}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-theme-muted block">Payment Mode</span>
                  <span className="font-semibold text-theme-text">{scannedData.payment_mode || "Card"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-theme-bg/60 border border-theme-border/40">
                  <span className="text-theme-muted block">Confidence</span>
                  <span className="font-semibold text-emerald-400">{(scannedData.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {scannedData.line_items && scannedData.line_items.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-theme-muted mb-2">Itemized Breakdown:</h5>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {scannedData.line_items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-theme-bg/40">
                        <span className="text-theme-text truncate max-w-[240px]">{item.item_name} {item.quantity ? `(x${item.quantity})` : ""}</span>
                        <span className="font-mono text-theme-muted">₹{Number(item.price).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSaveInstant}
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? "Saving..." : "⚡ Quick Log Expense"}
                </button>
                <button
                  onClick={handleEditInForm}
                  className="py-2.5 px-4 rounded-xl bg-theme-border/60 hover:bg-theme-border text-theme-text font-medium text-sm transition-all"
                >
                  Review & Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
