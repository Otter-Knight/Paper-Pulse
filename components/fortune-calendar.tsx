"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FortuneCalendarProps {
  checkInDates: string[]; // Array of date strings (ISO date only)
}

export function FortuneCalendar({ checkInDates }: FortuneCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get check-in dates for current month
  const checkInSet = useMemo(() => {
    return new Set(checkInDates.map(d => d.split('T')[0]));
  }, [checkInDates]);

  // Calculate stats
  const currentMonthCheckIns = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return checkInDates.filter(d => d.startsWith(monthStr)).length;
  }, [checkInDates, year, month]);

  const totalCheckIns = checkInDates.length;

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <Card className="w-[360px] h-[380px]">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPrevMonth}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium">
            {year}年 {monthNames[month]}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-secondary rounded transition-colors"
            disabled={isCurrentMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["日", "一", "二", "三", "四", "五", "六"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs text-muted-foreground font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-7" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isCheckedIn = checkInSet.has(dateStr);
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={day}
                className={`
                  h-7 flex items-center justify-center text-xs rounded
                  ${isCheckedIn
                    ? "bg-primary text-primary-foreground font-medium"
                    : isToday
                      ? "border border-primary text-primary"
                      : "text-muted-foreground"
                  }
                `}
                title={isCheckedIn ? "已签到" : ""}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">本月: </span>
              <span className="font-medium">{currentMonthCheckIns} 天</span>
            </div>
            <div>
              <span className="text-muted-foreground">总计: </span>
              <span className="font-medium">{totalCheckIns} 天</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
