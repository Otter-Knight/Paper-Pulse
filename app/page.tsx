"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getDailyPapers, getAllPapersList, Paper } from "@/lib/actions";
import { PaperCard } from "@/components/paper-card";
import { DateNav } from "@/components/date-nav";
import { FortuneCheckIn } from "@/components/fortune-checkin";
import { PaperFilters, TimeRange, PaperSource } from "@/components/paper-filters";
import { useReadHistoryStore } from "@/lib/read-history";

function filterPapers(
  papers: Paper[],
  timeRange: TimeRange,
  source: PaperSource,
  excludeRecentlyRead: boolean
): Paper[] {
  const now = new Date();
  const { isRecentlyRead } = useReadHistoryStore.getState();

  return papers.filter((paper) => {
    // Exclude recently read papers
    if (excludeRecentlyRead && isRecentlyRead(paper.id, 7)) {
      return false;
    }

    // Source filter
    if (source !== "all" && paper.source !== source) {
      return false;
    }

    // Time filter
    if (timeRange !== "all" && paper.publishedAt) {
      const publishedDate = new Date(paper.publishedAt);
      const monthsMap: Record<TimeRange, number> = {
        all: 0,
        "3months": 3,
        "6months": 6,
        "1year": 12,
      };
      const months = monthsMap[timeRange];
      const cutoffDate = new Date(now);
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      if (publishedDate < cutoffDate) {
        return false;
      }
    }

    return true;
  });
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams?.get("date");

  const [currentDate, setCurrentDate] = useState<Date>(
    dateParam ? new Date(dateParam + "T00:00:00Z") : new Date()
  );
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{ timeRange: TimeRange; source: PaperSource }>({
    timeRange: "all",
    source: "all",
  });
  const [excludeRead, setExcludeRead] = useState(true);

  // Load papers - use all papers for the feed
  useEffect(() => {
    async function loadPapers() {
      setIsLoading(true);
      try {
        // Get all papers for the feed
        const result = await getAllPapersList();
        setPapers(result);
      } catch (error) {
        console.error("Error loading papers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPapers();
  }, []);

  // Apply filters
  const filteredPapers = useMemo(() => {
    return filterPapers(papers, filters.timeRange, filters.source, excludeRead);
  }, [papers, filters, excludeRead]);

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleFilterChange = useCallback((newFilters: { timeRange: TimeRange; source: PaperSource }) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-xl font-semibold mb-6 tracking-tight">Daily Papers</h1>
        <DateNav currentDate={currentDate} onDateChange={handleDateChange} />
      </div>

      {/* Fortune Check-in */}
      <div className="mb-8">
        <FortuneCheckIn />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
        <PaperFilters onFilterChange={handleFilterChange} />

        {/* Exclude recently read toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={excludeRead}
            onChange={(e) => setExcludeRead(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">排除已读论文</span>
        </label>
      </div>

      {/* Results count */}
      {filteredPapers.length !== papers.length && papers.length > 0 && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          筛选结果: {filteredPapers.length} 篇论文
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            没有找到符合条件的论文
          </p>
          <p className="text-sm text-muted-foreground mt-1 opacity-70">
            尝试调整筛选条件
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper, index) => (
            <PaperCard key={paper.id} paper={paper} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
