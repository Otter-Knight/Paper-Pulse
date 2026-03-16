"use client";

import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TimeRange = "all" | "3months" | "6months" | "1year";
export type PaperSource = "all" | "arxiv" | "openreview";

interface PaperFiltersProps {
  onFilterChange: (filters: { timeRange: TimeRange; source: PaperSource }) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "3months", label: "3个月内" },
  { value: "6months", label: "6个月内" },
  { value: "1year", label: "1年内" },
];

const sourceOptions: { value: PaperSource; label: string }[] = [
  { value: "all", label: "全部来源" },
  { value: "arxiv", label: "arXiv" },
  { value: "openreview", label: "OpenReview" },
];

export function PaperFilters({ onFilterChange }: PaperFiltersProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [source, setSource] = useState<PaperSource>("all");
  const [isOpen, setIsOpen] = useState(false);

  // Load saved filters
  useEffect(() => {
    const saved = localStorage.getItem("paperpulse_filters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeRange(parsed.timeRange || "all");
        setSource(parsed.source || "all");
      } catch {
        // ignore
      }
    }
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange({ timeRange, source });
    localStorage.setItem("paperpulse_filters", JSON.stringify({ timeRange, source }));
  }, [timeRange, source, onFilterChange]);

  const hasActiveFilters = timeRange !== "all" || source !== "all";

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
          transition-colors border
          ${hasActiveFilters
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
          }
        `}
      >
        <Filter className="h-4 w-4" />
        <span>筛选</span>
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
            {(timeRange !== "all" ? 1 : 0) + (source !== "all" ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 card shadow-lg z-10 min-w-[240px] animate-fade-in">
          {/* Time Range */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block">
              发布时间
            </label>
            <div className="flex flex-wrap gap-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`
                    px-2.5 py-1.5 text-xs rounded-md transition-colors
                    ${timeRange === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block">
              来源
            </label>
            <div className="flex flex-wrap gap-1">
              {sourceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSource(option.value)}
                  className={`
                    px-2.5 py-1.5 text-xs rounded-md transition-colors
                    ${source === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setTimeRange("all");
                setSource("all");
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              清除筛选
            </button>
          )}
        </div>
      )}
    </div>
  );
}
