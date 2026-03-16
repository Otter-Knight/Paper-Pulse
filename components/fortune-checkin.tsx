"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { FortuneCalendar } from "./fortune-calendar";

// Fortune levels with more detailed content
type FortuneLevel = "大吉" | "中吉" | "小吉" | "吉" | "末吉" | "凶";

interface FortuneDetail {
  level: FortuneLevel;
  title: string;
  message: string;
  advice: string;
  luckyColor: string;
  luckyNumber: number;
  color: string;
  bgGradient: string;
}

// Expanded fortune details
const fortuneDetails: FortuneDetail[] = [
  {
    level: "大吉",
    title: "上上签",
    message: "今日学术运势极佳！灵感如泉涌，理解力Max，适合深入研究复杂论文。",
    advice: "宜：发起新研究课题、撰写重要论文、与同行深入交流",
    luckyColor: "金色",
    luckyNumber: 8,
    color: "#dc2626",
    bgGradient: "from-amber-50 to-yellow-100"
  },
  {
    level: "中吉",
    title: "上签",
    message: "思维清晰，效率不凡。遇到难题别慌，静心思考必有突破。",
    advice: "宜：处理遗留问题、复习重要概念、规划研究路线",
    luckyColor: "青色",
    luckyNumber: 6,
    color: "#ea580c",
    bgGradient: "from-teal-50 to-cyan-100"
  },
  {
    level: "小吉",
    title: "中签",
    message: "平稳的一天，按部就班会有收获。细节决定成败，注意文献引用规范。",
    advice: "宜：常规阅读、整理笔记、检查论文格式",
    luckyColor: "绿色",
    luckyNumber: 3,
    color: "#ca8a04",
    bgGradient: "from-emerald-50 to-green-100"
  },
  {
    level: "吉",
    title: "下签",
    message: "普通但充实的一天。遇到困难是正常的，保持耐心最重要。",
    advice: "宜：基础性工作、团队协作、求助导师",
    luckyColor: "蓝色",
    luckyNumber: 5,
    color: "#65a30d",
    bgGradient: "from-sky-50 to-blue-100"
  },
  {
    level: "末吉",
    title: "下下签",
    message: "今天可能有些不在状态，建议调整节奏，适度休息后再战。",
    advice: "宜：轻松阅读、浏览摘要、整理文献库",
    luckyColor: "紫色",
    luckyNumber: 2,
    color: "#0891b2",
    bgGradient: "from-violet-50 to-purple-100"
  },
  {
    level: "凶",
    title: "凶签",
    message: "学术低谷期，宜静心养性。不宜做重大决定，适合充电学习。",
    advice: "宜：阅读经典论文、学习新工具、反思研究方法",
    luckyColor: "灰色",
    luckyNumber: 1,
    color: "#7c3aed",
    bgGradient: "from-slate-50 to-gray-100"
  },
];

// Generate unique fortune based on user + date - more random, fewer bad fortunes
function generateDailyFortune(userId: string, date: Date): FortuneDetail {
  // Use user ID + date + random for more randomness
  const dateStr = date.toISOString().split("T")[0];
  const userHash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Weighted random - much higher chance for good fortunes
  // 大吉: 20%, 中吉: 25%, 小吉: 25%, 吉: 15%, 末吉: 10%, 凶: 5%
  const weights = [20, 25, 25, 15, 10, 5];
  const total = weights.reduce((a, b) => a + b, 0);

  // Add more randomness
  const randomOffset = Math.floor(Math.random() * 100);
  let random = (userHash + randomOffset) % total;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return fortuneDetails[i];
  }
  return fortuneDetails[0]; // Default to 大吉
}

export function FortuneCheckIn() {
  const [fortune, setFortune] = useState<FortuneDetail | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFortune, setShowFortune] = useState(false);
  const [checkInDates, setCheckInDates] = useState<string[]>([]);
  const [userId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("paperpulse_user_id");
      if (!id) {
        id = "user_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("paperpulse_user_id", id);
      }
      return id;
    }
    return "default_user";
  });

  // Load check-in dates on mount
  useEffect(() => {
    const saved = localStorage.getItem("fortune_checkin_dates");
    if (saved) {
      try {
        setCheckInDates(JSON.parse(saved));
      } catch {
        setCheckInDates([]);
      }
    }
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheckIn = localStorage.getItem("fortune_checkin_date");
    const savedFortune = localStorage.getItem("fortune_result");

    if (lastCheckIn === today && savedFortune) {
      try {
        setFortune(JSON.parse(savedFortune));
        setCheckedIn(true);
      } catch {
        // Invalid data, regenerate
      }
    }
  }, []);

  const handleCheckIn = useCallback(() => {
    setIsAnimating(true);
    setShowFortune(true);

    setTimeout(() => {
      const newFortune = generateDailyFortune(userId, new Date());
      const today = new Date().toISOString().split("T")[0];

      setFortune(newFortune);
      setCheckedIn(true);
      setIsAnimating(false);

      // Save today's fortune
      localStorage.setItem("fortune_checkin_date", new Date().toDateString());
      localStorage.setItem("fortune_result", JSON.stringify(newFortune));

      // Update check-in dates
      const newDates = [...checkInDates, today];
      setCheckInDates(newDates);
      localStorage.setItem("fortune_checkin_dates", JSON.stringify(newDates));
    }, 2000);
  }, [userId, checkInDates]);

  const handleReset = () => {
    // Clear today's fortune to allow re-drawing (for testing)
    localStorage.removeItem("fortune_checkin_date");
    localStorage.removeItem("fortune_result");
    setCheckedIn(false);
    setFortune(null);
    setShowFortune(false);
  };

  return (
    <div className="flex gap-4 items-start justify-center flex-wrap">
      {/* Fortune Check-in */}
      <div className="w-[360px]">
      {!showFortune ? (
        // Initial state - draw fortune
        <div className="card p-8 text-center h-[380px] flex flex-col">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">今日运势</h3>
          </div>

          <p className="text-muted-foreground mb-6 flex-1">
            点击求签，开启今日科研之旅
          </p>

          <button
            onClick={handleCheckIn}
            disabled={isAnimating}
            className={`
              relative px-10 py-4 bg-gradient-to-b from-amber-50 to-amber-100
              border-2 border-amber-200 rounded-lg shadow-md
              hover:shadow-lg transition-all duration-200
              ${isAnimating ? "animate-bounce" : "hover:-translate-y-1"}
            `}
            style={{
              background: "linear-gradient(145deg, #fffbeb, #fef3c7)",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)"
            }}
          >
            {isAnimating ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                <span className="text-amber-700 font-medium">摇签中...</span>
              </div>
            ) : (
              <span className="text-amber-700 font-bold text-lg">求 签</span>
            )}
          </button>
        </div>
      ) : isAnimating ? (
        // Animating state
        <div className="card p-8 text-center h-[380px] flex flex-col items-center justify-center">
          <div className="relative w-32 h-40 mx-auto mb-4">
            {/* Animated shaking fortune slip */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg shadow-lg animate-pulse">
              <div className="flex items-center justify-center h-full">
                <div className="text-4xl">🎋</div>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">
            卜算中...
          </p>
        </div>
      ) : fortune ? (
        // Show fortune result
        <div className={`
          card p-6 text-center overflow-hidden h-[380px]
          bg-gradient-to-br ${fortune.bgGradient}
          animate-fade-in relative
        `}>
          {/* Close button */}
          <button
            onClick={() => setShowFortune(false)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Fortune level badge */}
          <div
            className="inline-block px-4 py-1 rounded-full text-white text-sm font-bold mb-3"
            style={{ backgroundColor: fortune.color }}
          >
            {fortune.level}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2" style={{ color: fortune.color }}>
            {fortune.title}
          </h3>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-2 my-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400"></div>
            <span className="text-amber-500">✦</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400"></div>
          </div>

          {/* Main message */}
          <p className="text-sm leading-relaxed mb-4">
            {fortune.message}
          </p>

          {/* Advice */}
          <div className="text-xs text-muted-foreground mb-4 p-2 bg-white/50 rounded">
            📌 {fortune.advice}
          </div>

          {/* Lucky info */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div>
              <span className="text-muted-foreground">幸运色: </span>
              <span className="font-medium">{fortune.luckyColor}</span>
            </div>
            <div>
              <span className="text-muted-foreground">幸运数: </span>
              <span className="font-medium">{fortune.luckyNumber}</span>
            </div>
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground mt-4">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })} · 每日一签
          </p>

          {/* Reset button (for testing) */}
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground mt-2 underline"
          >
            重新求签
          </button>
        </div>
      ) : null}
      </div>

      {/* Calendar */}
      <div className="flex-shrink-0">
        <FortuneCalendar checkInDates={checkInDates} />
      </div>
    </div>
  );
}
