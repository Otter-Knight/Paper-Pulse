"use client";

import { useState, useEffect } from "react";
import { Settings, X, Clock, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InterestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preferences: {
    keywords: string[];
    authors: string[];
    categories: string[];
    timeRange: string;
    sources: string[];
  }) => void;
  initialPreferences?: {
    keywords: string[];
    authors: string[];
    categories: string[];
    timeRange?: string;
    sources?: string[];
  };
}

const TIME_OPTIONS = [
  { value: "all", label: "全部时间" },
  { value: "3months", label: "3个月内" },
  { value: "6months", label: "6个月内" },
  { value: "1year", label: "1年内" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "全部来源" },
  { value: "arxiv", label: "arXiv" },
  { value: "openreview", label: "OpenReview" },
];

export function InterestsModal({
  open,
  onOpenChange,
  onSave,
  initialPreferences,
}: InterestsModalProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("all");
  const [sources, setSources] = useState<string[]>(["all"]);

  const [keywordInput, setKeywordInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  useEffect(() => {
    if (initialPreferences) {
      setKeywords(initialPreferences.keywords);
      setAuthors(initialPreferences.authors);
      setCategories(initialPreferences.categories);
      setTimeRange(initialPreferences.timeRange || "all");
      setSources(initialPreferences.sources || ["all"]);
    }
  }, [initialPreferences, open]);

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const addAuthor = () => {
    if (authorInput.trim() && !authors.includes(authorInput.trim())) {
      setAuthors([...authors, authorInput.trim()]);
      setAuthorInput("");
    }
  };

  const addCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const toggleSource = (value: string) => {
    if (value === "all") {
      setSources(["all"]);
    } else {
      const newSources = sources.filter(s => s !== "all");
      if (newSources.includes(value)) {
        const filtered = newSources.filter(s => s !== value);
        setSources(filtered.length === 0 ? ["all"] : filtered);
      } else {
        setSources([...newSources, value]);
      }
    }
  };

  const handleSave = () => {
    onSave({ keywords, authors, categories, timeRange, sources });
    localStorage.setItem(
      "paperPulse_preferences",
      JSON.stringify({ keywords, authors, categories, timeRange, sources })
    );
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, addFn: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFn();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            个性化设置
          </DialogTitle>
          <DialogDescription>
            自定义你的推荐内容，包括关键词、作者、分类、时间和来源。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Time Range */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              发布时间
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TIME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    timeRange === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              来源
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SOURCE_OPTIONS.map((option) => {
                const isSelected = sources.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleSource(option.value)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-sm font-medium mb-2 block">关键词</label>
            <div className="flex gap-2">
              <Input
                placeholder="添加关键词 (如: transformers)"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addKeyword)}
              />
              <Button onClick={addKeyword} variant="secondary">
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((kw, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {kw}
                  <button onClick={() => removeKeyword(index)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Authors */}
          <div>
            <label className="text-sm font-medium mb-2 block">作者</label>
            <div className="flex gap-2">
              <Input
                placeholder="添加作者姓名"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addAuthor)}
              />
              <Button onClick={addAuthor} variant="secondary">
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {authors.map((author, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
                >
                  {author}
                  <button onClick={() => removeAuthor(index)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-medium mb-2 block">分类</label>
            <div className="flex gap-2">
              <Input
                placeholder="添加分类 (如: NLP)"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addCategory)}
              />
              <Button onClick={addCategory} variant="secondary">
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((cat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-sm"
                >
                  {cat}
                  <button onClick={() => removeCategory(index)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button onClick={handleSave} className="flex-1">
              保存设置
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
