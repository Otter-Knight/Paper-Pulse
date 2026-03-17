"use client";

import { useState, useEffect } from "react";
import { BookOpen, Globe, Loader2 } from "lucide-react";
import { Paper } from "@/lib/actions";

interface AbstractWithTranslationProps {
  paper: Paper;
}

export function AbstractWithTranslation({ paper }: AbstractWithTranslationProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Load cached translation from localStorage
  useEffect(() => {
    if (paper.abstract) {
      const cached = localStorage.getItem(`translation_${paper.id}`);
      if (cached) {
        setTranslation(cached);
      } else {
        setTranslation(null);
        setShowTranslation(false);
      }
    }
  }, [paper.id, paper.abstract]);

  const handleTranslate = async () => {
    if (!paper.abstract) return;

    setIsTranslating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "",
          paperTitle: paper.title,
          paperAbstract: paper.abstract,
          isTranslationRequest: true,
        }),
      });

      if (response.ok) {
        const text = await response.text();
        setTranslation(text);
        setShowTranslation(true);
        // Cache the translation
        localStorage.setItem(`translation_${paper.id}`, text);
      } else {
        console.error("Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleTranslation = () => {
    if (!translation) {
      handleTranslate();
    } else {
      setShowTranslation(!showTranslation);
    }
  };

  if (!paper.abstract) {
    return (
      <p className="text-sm text-muted-foreground">暂无摘要</p>
    );
  }

  return (
    <div className="space-y-4">
      {/* English Abstract */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Abstract</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {paper.abstract}
        </p>
      </div>

      {/* Translate Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTranslation}
          disabled={isTranslating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              翻译中...
            </>
          ) : showTranslation ? (
            <>
              <Globe className="h-3.5 w-3.5" />
              隐藏翻译
            </>
          ) : (
            <>
              <Globe className="h-3.5 w-3.5" />
              显示中文翻译
            </>
          )}
        </button>
      </div>

      {/* Chinese Translation */}
      {showTranslation && translation && (
        <div className="animate-fade-in pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">中文</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {translation}
          </p>
        </div>
      )}
    </div>
  );
}
