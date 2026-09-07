"use client";

import React, { useState, useEffect, useRef } from "react";
import { quickParseExpense } from "@/lib/api/ai";
import { createExpense } from "@/lib/api/expenses";
import { AIQuickParseResponse } from "@/types/ai";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles,
  Mic,
  MicOff,
  CornerDownLeft,
  X,
  Check,
  Edit3,
  Tag,
  Calendar,
  CreditCard,
  Zap,
  ArrowRight,
  Bot,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants } from "@/lib/animations/variants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenFullFormWithData?: (parsedData: Partial<AIQuickParseResponse>) => void;
}

const EXAMPLE_PROMPTS = [
  "Uber 240 cash yesterday",
  "Dmart groceries 1450 via UPI",
  "Coffee 180 card today",
  "Kal petrol 500 cash",
  "Chai nashta 60 upi",
  "Netflix 499 card",
];

export default function QuickAddModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenFullFormWithData,
}: Props) {
  const queryClient = useQueryClient();
  const { formatAmount, currency } = useCurrency();
  const [inputText, setInputText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedResult, setParsedResult] = useState<AIQuickParseResponse | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN"; // English (India) with Hinglish support

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setInputText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            toast.error("Microphone permission denied");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Reset and focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputText("");
      setParsedResult(null);
      setIsListening(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);

  const toggleVoiceListening = () => {
    if (!speechSupported) {
      toast.info("Voice input is not supported in this browser. Please type your phrase.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn("Failed to start speech recognition:", err);
      }
    }
  };

  const handleParse = async (textToParse?: string) => {
    const text = (textToParse || inputText).trim();
    if (!text) {
      toast.error("Please enter or speak an expense sentence");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    }

    setIsParsing(true);
    try {
      const result = await quickParseExpense({ text });
      setParsedResult(result);
    } catch (err: any) {
      toast.error(err?.message || "Failed to parse expense");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!parsedResult) return;

    setIsSaving(true);
    try {
      await createExpense({
        title: parsedResult.title,
        amount: Number(parsedResult.amount),
        date: parsedResult.date,
        category_id: parsedResult.category_id,
        notes: parsedResult.notes,
        payment_mode: parsedResult.payment_mode || "UPI",
      });

      toast.success(`Logged "${parsedResult.title}" (${formatAmount(parsedResult.amount)}) ✨`);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-top-categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-average-spend"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-comparison"] });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to log expense");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenFullForm = () => {
    if (!parsedResult) return;
    if (onOpenFullFormWithData) {
      onOpenFullFormWithData(parsedResult);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl z-10"
        >
          {/* Top Decorative Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Quick Add
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    Natural Language
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Type or speak in plain English, Hinglish, or Marathi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            {/* Input & Voice Bar */}
            <div className="relative">
              <div
                className={`relative flex items-center rounded-xl bg-slate-900/90 border transition-all ${
                  isListening
                    ? "border-red-500 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10"
                    : "border-slate-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isParsing) {
                      e.preventDefault();
                      handleParse();
                    }
                  }}
                  placeholder={
                    isListening
                      ? "Listening... Speak your expense..."
                      : 'e.g. "Uber 240 cash yesterday" or "Dmart groceries 1450 upi"'
                  }
                  className="w-full bg-transparent px-4 py-3.5 pr-24 text-sm text-white placeholder-slate-500 focus:outline-none"
                  disabled={isParsing || isSaving}
                />

                {/* Right controls */}
                <div className="absolute right-2 flex items-center gap-1">
                  {/* Voice Button */}
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceListening}
                      title={isListening ? "Stop listening" : "Speak your expense"}
                      className={`p-2 rounded-lg transition ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30"
                          : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Parse / Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleParse()}
                    disabled={isParsing || !inputText.trim()}
                    className="flex items-center justify-center p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition shadow-md shadow-emerald-900/30"
                    title="Parse sentence"
                  >
                    {isParsing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CornerDownLeft className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Listening Status Indicator */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 px-1 text-xs text-red-400 font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Recording audio... Say something like "Paid 300 for petrol cash"
                </motion.div>
              )}
            </div>

            {/* Suggestion Chips */}
            {!parsedResult && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Try examples:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setInputText(prompt);
                        handleParse(prompt);
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 text-slate-300 border border-slate-700/60 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Parsed Preview Card */}
            {parsedResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Parsed Result
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 font-medium border border-slate-600/40 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    {parsedResult.engine_used === "gemini" ? "Gemini 1.5 Flash" : "Local NLP Engine"}
                  </span>
                </div>

                {/* Key Expense Attributes */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Title & Amount */}
                  <div className="col-span-2 flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Expense Title</p>
                      <p className="text-sm font-bold text-white">{parsedResult.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 font-medium">Amount</p>
                      <p className="text-base font-extrabold text-emerald-400">
                        {formatAmount(parsedResult.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/70">
                    <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400">Category</p>
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {parsedResult.category_name}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/70">
                    <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400">Date</p>
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {parsedResult.date}
                      </p>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="flex items-center gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/70">
                    <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400">Payment Mode</p>
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {parsedResult.payment_mode || "UPI"}
                      </p>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/70">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400">Accuracy</p>
                      <p className="text-xs font-bold text-emerald-400">
                        {Math.round((parsedResult.confidence || 0.95) * 100)}% Match
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveExpense}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition active:scale-95"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm & Log Expense
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenFullForm}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-600/50 transition active:scale-95"
                    title="Open full edit form"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Form
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
