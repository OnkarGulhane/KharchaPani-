"use client";

import React, { useState, useEffect, useRef } from "react";
import { parseVoiceExpense } from "@/lib/api/ai";
import { createExpense } from "@/lib/api/expenses";
import { VoiceExpenseResponse } from "@/types/ai";
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RefreshCw,
  Edit3,
  Calendar,
  CreditCard,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface VoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
  onOpenFullForm?: (parsedData: any) => void;
}

export function VoiceExpenseModal({
  isOpen,
  onClose,
  onExpenseCreated,
  onOpenFullForm,
}: VoiceExpenseModalProps) {
  const [selectedLang, setSelectedLang] = useState<"mr-IN" | "hi-IN" | "en-IN">("mr-IN");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<VoiceExpenseResponse | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = selectedLang;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            toast.error("Microphone permission denied. Please allow microphone or select a quick example below.");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, [selectedLang]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast.info("Voice speech recognition is not supported in this browser environment. You can type or tap an example below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setParsedResult(null);
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Recognition start failed, stopping and restarting...", err);
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  const handleParseTranscript = async (textToParse?: string) => {
    const text = (textToParse || transcript).trim();
    if (!text) {
      toast.error("Please speak or enter a voice phrase first.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsParsing(true);
    try {
      const langCode = selectedLang.split("-")[0];
      const result = await parseVoiceExpense(undefined, text, langCode);
      setParsedResult(result);
      toast.success(`Parsed: ₹${result.amount} for ${result.title} ✨`);
    } catch {
      toast.error("Failed to parse voice expense.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsedResult) return;
    setIsSubmitting(true);
    try {
      await createExpense({
        title: parsedResult.title,
        amount: parsedResult.amount,
        date: parsedResult.date,
        category_id: parsedResult.category_id,
        payment_mode: parsedResult.payment_mode || "Cash",
        notes: parsedResult.notes || `Added via Voice (${parsedResult.detected_language})`,
      });
      toast.success(`Expense ₹${parsedResult.amount} saved successfully! 🎉`);
      onExpenseCreated();
      onClose();
    } catch {
      toast.error("Failed to save expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-indigo-500/10 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                <Volume2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  बोली खर्चा (Voice-to-Expense)
                </h2>
                <p className="text-xs text-gray-400">Speak naturally in Marathi, Hindi, or English.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selector Chips */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[
              { code: "mr-IN", label: "मराठी (Marathi)" },
              { code: "hi-IN", label: "हिंदी (Hindi)" },
              { code: "en-IN", label: "English" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code as any);
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLang === lang.code
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25 scale-105"
                    : "bg-gray-800/80 hover:bg-gray-800 text-gray-400 border border-gray-700/60"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Big Mic Button Section */}
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Pulse rings when listening */}
              {isListening && (
                <>
                  <span className="absolute w-28 h-28 rounded-full bg-indigo-500/30 animate-ping" />
                  <span className="absolute w-36 h-36 rounded-full bg-purple-500/20 animate-pulse" />
                </>
              )}

              <button
                onClick={toggleListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-90 shadow-xl ${
                  isListening
                    ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/40 text-white"
                    : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-indigo-500/40 text-white hover:scale-105"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <p className="mt-3 text-xs font-bold text-gray-300">
              {isListening ? (
                <span className="text-rose-400 animate-pulse">● Listening... Speak now</span>
              ) : (
                "Tap mic to start speaking"
              )}
            </p>

            {/* Example prompt hints */}
            <p className="mt-1 text-[11px] text-gray-400 text-center max-w-xs">
              {selectedLang === "mr-IN"
                ? "किंवा खालील उदाहरणावर टॅप करा:"
                : selectedLang === "hi-IN"
                ? "या नीचे दिए गए उदाहरण पर टैप करें:"
                : "Or tap an example prompt below:"}
            </p>

            {/* Quick Suggestion Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center max-w-md">
              {(selectedLang === "mr-IN"
                ? ["चहा नाश्ता ६० UPI", "काल पेट्रोल ५०० कॅश", "किराणा १४५० UPI", "भाजीपाला ३५०"]
                : selectedLang === "hi-IN"
                ? ["चाय नाश्ता ६० UPI", "कल पेट्रोल ५०० कैश", "किराना १४५० UPI", "खाना ४५०"]
                : ["Coffee 180 UPI", "Uber 240 cash", "Groceries 1450 UPI", "Netflix 499 card"]
              ).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setTranscript(chip);
                    handleParseTranscript(chip);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 active:scale-95 transition-all shadow-sm"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Live Transcript Box */}
          <div className="mt-5 p-3.5 bg-gray-800/60 rounded-2xl border border-gray-700/60">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Transcribed Voice Text
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words will appear here. You can also type or edit..."
              rows={2}
              className="w-full bg-transparent text-sm text-white focus:outline-none resize-none placeholder-gray-600"
            />
            {transcript && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleParseTranscript()}
                  disabled={isParsing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isParsing ? "Analyzing..." : "Process Voice Text"}
                </button>
              </div>
            )}
          </div>

          {/* Parsed Result Card */}
          {parsedResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Extracted Expense
                </span>
                <span className="text-[11px] text-gray-400">{parsedResult.detected_language}</span>
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-white">{parsedResult.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      {parsedResult.category_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-purple-400" />
                      {parsedResult.payment_mode || "Cash"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      {parsedResult.date}
                    </span>
                  </div>
                </div>
                <div className="text-xl font-black text-emerald-400">
                  ₹{Number(parsedResult.amount).toLocaleString("en-IN")}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleConfirmSave}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save Expense"}
                </button>

                {onOpenFullForm && (
                  <button
                    onClick={() => {
                      onOpenFullForm(parsedResult);
                      onClose();
                    }}
                    className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl border border-gray-700 transition-all flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
