"use client";

import React, { useState, useRef, useEffect } from "react";
import { chatWithKharchaGuru } from "@/lib/api/ai";
import { AIChatMessage, MiniChartData } from "@/types/ai";
import { toast } from "sonner";

export const KharchaGuruChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: "assistant",
      content: "Namaste! I am **Kharcha Guru**, your personal AI financial advisor. 💰\n\nAsk me anything about your expenses, budget health, savings tips, or recurring bills!",
    },
  ]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What is my highest spend category this month?",
    "How can I save ₹5,000 this month?",
    "What are my active subscriptions?",
  ]);
  const [currentChart, setCurrentChart] = useState<MiniChartData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (msgText?: string) => {
    const text = (msgText || inputMessage).trim();
    if (!text || isLoading) return;

    const newHistory: AIChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await chatWithKharchaGuru({
        message: text,
        history: newHistory.slice(-4),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }
      if (res.mini_chart) {
        setCurrentChart(res.mini_chart);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reach Kharcha Guru");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble connecting to the financial intelligence engine. Please try asking again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce-subtle">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all duration-300 border border-white/20"
          >
            <div className="relative">
              <span className="text-xl">🤖</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-sm tracking-wide">Ask Kharcha Guru</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded-md font-mono">AI</span>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[560px] bg-theme-surface/95 backdrop-blur-xl border border-theme-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-theme-border bg-gradient-to-r from-indigo-600/15 via-violet-600/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
                  Kharcha Guru
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-theme-muted">AI Financial Intelligence Advisor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-border/40 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0 mt-1 border border-indigo-500/30">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md shadow-indigo-500/20"
                      : "bg-theme-card border border-theme-border/60 text-theme-text rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Embedded Mini Chart */}
            {currentChart && (
              <div className="p-3 rounded-xl bg-theme-card border border-theme-border/60 my-2">
                <p className="text-xs font-semibold text-theme-muted mb-2">{currentChart.title || "Breakdown"}</p>
                <div className="space-y-1.5">
                  {currentChart.labels.map((label, i) => {
                    const val = currentChart.values[i] || 0;
                    const maxVal = Math.max(...currentChart.values, 1);
                    const pct = (val / maxVal) * 100;
                    return (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between text-theme-muted mb-0.5">
                          <span>{label}</span>
                          <span className="font-mono text-theme-text">₹{val.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="w-full h-1.5 bg-theme-border/40 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-theme-muted text-xs p-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>Analyzing your financial data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {suggestedQuestions.length > 0 && (
            <div className="px-4 py-2 border-t border-theme-border/40 flex gap-2 overflow-x-auto no-scrollbar bg-theme-card/30">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 px-2.5 py-1 text-[11px] rounded-full bg-theme-card hover:bg-indigo-500/10 hover:border-indigo-500/30 text-theme-muted hover:text-indigo-400 border border-theme-border transition-all"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-theme-border bg-theme-surface flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. Swiggy spend, save money)..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 py-2 px-3.5 rounded-xl bg-theme-card border border-theme-border text-theme-text placeholder-theme-muted text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-indigo-600/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
