"use client";

import { useState } from "react";
import { FileText, Sparkles, StickyNote, BookOpen, LayoutGrid } from "lucide-react";
import { Paper } from "@/lib/actions";
import { AISummary } from "@/components/ai-summary";
import { StickyNotePanel } from "@/components/sticky-note";
import { PDFViewer } from "@/components/pdf-viewer";
import { AbstractWithTranslation } from "@/components/abstract-with-translation";
import { PaperOverview } from "@/components/paper-overview";

interface PaperContentTabsProps {
  paper: Paper;
}

type TabType = "abstract" | "overview" | "pdf" | "summary" | "notes";

export function PaperContentTabs({ paper }: PaperContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("abstract");

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "abstract", label: "摘要", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "overview", label: "速览", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
    { id: "pdf", label: "PDF", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "summary", label: "AI摘要", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "notes", label: "笔记", icon: <StickyNote className="h-3.5 w-3.5" /> },
  ];

  return (
    <div>
      {/* Title */}
      <h1 className="text-xl font-semibold leading-snug mb-4">
        {paper.title}
      </h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-4 -mx-4 px-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px] overflow-y-auto">
        {activeTab === "abstract" && (
          <div className="animate-fade-in">
            <AbstractWithTranslation paper={paper} />
          </div>
        )}

        {activeTab === "overview" && (
          <div className="animate-fade-in">
            <PaperOverview paper={paper} />
          </div>
        )}

        {activeTab === "pdf" && (
          <div className="animate-fade-in -mx-4 min-h-[600px]">
            <PDFViewer paper={paper} />
          </div>
        )}

        {activeTab === "summary" && (
          <div className="animate-fade-in">
            <AISummary paper={paper} />
          </div>
        )}

        {activeTab === "notes" && (
          <div className="animate-fade-in">
            <StickyNotePanel paperId={paper.id} paperTitle={paper.title} paperAuthors={paper.authors} />
          </div>
        )}
      </div>
    </div>
  );
}
