"use client";

import { useState, useEffect, useMemo } from "react";
import { Settings } from "lucide-react";
import { getPersonalizedFeed, getAllPapersList, Paper } from "@/lib/actions";
import { PaperCard } from "@/components/paper-card";
import { Button } from "@/components/ui/button";
import { InterestsModal } from "@/components/interests-modal";
import { useReadHistoryStore } from "@/lib/read-history";

const defaultPreferences = {
  keywords: ["transformers", "language models", "attention"],
  authors: [] as string[],
  categories: ["NLP", "Deep Learning"],
  timeRange: "all",
  sources: ["all"] as string[],
};

function filterPapers(
  papers: Paper[],
  keywords: string[],
  authors: string[],
  categories: string[],
  timeRange: string,
  sources: string[]
): Paper[] {
  const now = new Date();

  return papers.filter((paper) => {
    // Source filter
    if (sources.length > 0 && !sources.includes("all") && !sources.includes(paper.source)) {
      return false;
    }

    // Time filter
    if (timeRange !== "all" && paper.publishedAt) {
      const publishedDate = new Date(paper.publishedAt);
      const monthsMap: Record<string, number> = {
        all: 0,
        "3months": 3,
        "6months": 6,
        "1year": 12,
      };
      const months = monthsMap[timeRange] || 0;
      const cutoffDate = new Date(now);
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      if (publishedDate < cutoffDate) {
        return false;
      }
    }

    // Keyword filter
    if (keywords.length > 0) {
      const searchText = `${paper.title} ${paper.abstract || ""} ${paper.tags.join(" ")}`.toLowerCase();
      const hasKeyword = keywords.some((kw) => searchText.includes(kw.toLowerCase()));
      if (!hasKeyword) return false;
    }

    // Author filter
    if (authors.length > 0) {
      const hasAuthor = authors.some((author) =>
        paper.authors.some((a) => a.toLowerCase().includes(author.toLowerCase()))
      );
      if (!hasAuthor) return false;
    }

    // Category/tag filter
    if (categories.length > 0) {
      const hasCategory = categories.some((cat) =>
        paper.tags.some((tag) => tag.toLowerCase().includes(cat.toLowerCase()))
      );
      if (!hasCategory) return false;
    }

    return true;
  });
}

export default function FeedPage() {
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  // Load all papers
  useEffect(() => {
    async function loadPapers() {
      setIsLoading(true);
      try {
        const result = await getAllPapersList();
        setAllPapers(result);
      } catch (error) {
        console.error("Error loading papers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPapers();
  }, []);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem("paperPulse_preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch {
        // use default
      }
    }
  }, []);

  const filteredPapers = useMemo(() => {
    return filterPapers(
      allPapers,
      preferences.keywords,
      preferences.authors,
      preferences.categories,
      preferences.timeRange,
      preferences.sources
    );
  }, [allPapers, preferences]);

  const handleSavePreferences = (newPrefs: typeof preferences) => {
    setPreferences(newPrefs);
    localStorage.setItem("paperPulse_preferences", JSON.stringify(newPrefs));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">个性化推荐</h1>
          <p className="text-sm text-muted-foreground mt-1">
            根据您的兴趣推荐的论文 ({filteredPapers.length} 篇)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            没有找到符合条件的论文
          </p>
          <p className="text-sm text-muted-foreground mt-1 opacity-70">
            尝试调整您的兴趣设置
          </p>
          <Button onClick={() => setModalOpen(true)} className="mt-4">
            <Settings className="h-4 w-4 mr-2" />
            修改设置
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper, index) => (
            <PaperCard key={paper.id} paper={paper} index={index} />
          ))}
        </div>
      )}

      {/* Floating Edit Button */}
      <Button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 rounded-md h-10 w-10 p-0 shadow-lg"
        size="icon"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <InterestsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSavePreferences}
        initialPreferences={preferences}
      />
    </div>
  );
}
