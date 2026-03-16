"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface DateNavProps {
  currentDate: Date;
  onDateChange?: (date: Date) => void;
}

export function DateNav({ currentDate, onDateChange }: DateNavProps) {
  const router = useRouter();

  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    if (onDateChange) {
      onDateChange(newDate);
    } else {
      const dateStr = newDate.toISOString().split("T")[0];
      router.push(`/?date=${dateStr}`);
    }
  };

  const goToToday = () => {
    const today = new Date();
    if (onDateChange) {
      onDateChange(today);
    } else {
      const dateStr = today.toISOString().split("T")[0];
      router.push(`/?date=${dateStr}`);
    }
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigateDate(-1)}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 min-w-[180px] justify-center">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{formatDate(currentDate)}</span>
      </div>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigateDate(1)}
        disabled={isToday}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isToday && (
        <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
          Today
        </Button>
      )}
    </div>
  );
}
