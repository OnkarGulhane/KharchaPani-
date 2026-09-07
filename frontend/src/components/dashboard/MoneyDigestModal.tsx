"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMoneyDigest } from "@/lib/api/ai";
import { MoneyDigestResponse, DigestStorySlide } from "@/types/ai";
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Flame,
  Zap,
  ShieldCheck,
  Utensils,
  ShoppingBag,
  Share2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface MoneyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoneyDigestModal({ isOpen, onClose }: MoneyDigestModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const { data, isLoading, error } = useQuery<MoneyDigestResponse>({
    queryKey: ["money-digest"],
    queryFn: () => getMoneyDigest(),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const slides: DigestStorySlide[] = data?.slides || [];
  const activeSlide = slides[currentSlideIndex];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      toast.success("You've completed your Monthly Wrap! 🎉");
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const getGradientClass = (theme: string) => {
    switch (theme) {
      case "midnight":
        return "from-slate-950 via-indigo-950 to-blue-950 border-indigo-500/30";
      case "emerald":
        return "from-teal-950 via-emerald-950 to-green-950 border-emerald-500/30";
      case "neon_purple":
        return "from-purple-950 via-fuchsia-950 to-pink-950 border-pink-500/30";
      case "amber_gold":
        return "from-amber-950 via-orange-950 to-yellow-950 border-amber-500/30";
      case "sunset":
      default:
        return "from-rose-950 via-purple-950 to-indigo-950 border-rose-500/30";
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className="w-12 h-12 text-amber-300" />;
      case "flame":
        return <Flame className="w-12 h-12 text-orange-400 animate-bounce" />;
      case "zap":
        return <Zap className="w-12 h-12 text-yellow-300 animate-pulse" />;
      case "shield-check":
        return <ShieldCheck className="w-12 h-12 text-emerald-300" />;
      case "utensils":
        return <Utensils className="w-12 h-12 text-pink-300" />;
      case "shopping-bag":
        return <ShoppingBag className="w-12 h-12 text-purple-300" />;
      default:
        return <Sparkles className="w-12 h-12 text-indigo-300 animate-pulse" />;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `My KharchaPani ${data?.month_name} Wrap!`,
          text: `I earned the persona "${data?.financial_persona_title}" on KharchaPani! Check your financial wrap.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `🏆 My ${data?.month_name} Financial Persona: ${data?.financial_persona_title}! Track your expenses with KharchaPani.`
      );
      toast.success("Wrapped summary copied to clipboard! Share with friends 🚀");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-md h-[580px] sm:h-[620px] bg-gradient-to-b ${getGradientClass(
            activeSlide?.gradient_theme || "sunset"
          )} border rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between text-white overflow-hidden`}
        >
          {/* Top Story Progress Bars */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              {slides.map((s, idx) => (
                <div
                  key={s.slide_id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx === currentSlideIndex
                        ? "w-full"
                        : idx < currentSlideIndex
                        ? "w-full opacity-80"
                        : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 border border-white/20 backdrop-blur-md">
                  {data?.month_name || "Monthly"} Wrap 🎧
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loading / Error / Main Slide Content */}
          {isLoading ? (
            <div className="my-auto text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold animate-pulse text-white/80">
                Compiling your Spotify-Wrapped Money Story... ✨
              </p>
            </div>
          ) : error || !data || !activeSlide ? (
            <div className="my-auto text-center text-white/80">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-80" />
              <p className="text-sm">Unable to generate money digest.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.slide_id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                transition={{ duration: 0.25 }}
                className="my-auto flex flex-col items-center text-center px-2"
              >
                {/* Badge Icon */}
                <div className="p-5 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl mb-4">
                  {getBadgeIcon(activeSlide.badge_icon)}
                </div>

                {/* Subtitle */}
                <span className="text-[11px] font-bold tracking-widest uppercase text-white/60 mb-1">
                  {activeSlide.subtitle}
                </span>

                {/* Main Headline */}
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {activeSlide.title}
                </h3>

                {/* Highlighted Metric */}
                {activeSlide.metric_value && (
                  <div className="my-3 px-4 py-1.5 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md shadow-lg">
                    <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                      {activeSlide.metric_value}
                    </span>
                  </div>
                )}

                {/* Story Narrative */}
                <p className="mt-2 text-xs sm:text-sm text-white/90 leading-relaxed max-w-xs font-medium">
                  {activeSlide.narrative}
                </p>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Bottom Story Action & Navigation */}
          <div>
            <div className="flex items-center justify-between pt-3 border-t border-white/15">
              <button
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-black shadow-lg backdrop-blur-md transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Story
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Index Counter */}
            <div className="mt-2 text-center text-[10px] text-white/50 font-semibold">
              Slide {currentSlideIndex + 1} of {slides.length} • Powered by Gemini AI ✨
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
