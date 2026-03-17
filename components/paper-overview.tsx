"use client";

import { useState, useEffect } from "react";
import { FileQuestion, Target, FlaskConical, BarChart3, CheckCircle, Loader2, Globe } from "lucide-react";
import { Paper } from "@/lib/actions";

interface OverviewItem {
  motivation: string;
  method: string;
  result: string;
  conclusion: string;
}

interface Translation {
  motivation: string;
  method: string;
  result: string;
  conclusion: string;
}

interface PaperOverviewProps {
  paper: Paper;
}

interface OverviewBoxProps {
  icon: React.ReactNode;
  title: string;
  titleZh: string;
  content: string;
  translation?: string;
  color: string;
}

function OverviewBox({ icon, title, titleZh, content, translation, color }: OverviewBoxProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div
      className="rounded-xl p-4 border transition-all hover:shadow-md"
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, ${color}05 100%)`,
        borderColor: `${color}30`
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: `${color}20`, color: color }}
        >
          {icon}
        </div>
        <div>
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground ml-2">{titleZh}</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground leading-relaxed mb-2">
        {content}
      </div>

      {translation && (
        <>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Globe className="h-3 w-3" />
            {showTranslation ? "隐藏翻译" : "显示翻译"}
          </button>

          {showTranslation && (
            <div className="mt-2 pt-2 border-t border-border animate-fade-in">
              <div className="text-xs text-muted-foreground leading-relaxed">
                {translation}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function PaperOverview({ paper }: PaperOverviewProps) {
  const [overview, setOverview] = useState<OverviewItem | null>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Load cached overview from localStorage
  useEffect(() => {
    if (paper.abstract) {
      const cachedOverview = localStorage.getItem(`overview_${paper.id}`);
      if (cachedOverview) {
        setOverview(JSON.parse(cachedOverview));
      }

      const cachedTranslation = localStorage.getItem(`overview_translation_${paper.id}`);
      if (cachedTranslation) {
        setTranslation(JSON.parse(cachedTranslation));
      }
    }
  }, [paper.id, paper.abstract]);

  const generateOverview = async () => {
    if (!paper.abstract) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperTitle: paper.title,
          paperAbstract: paper.abstract,
          isOverviewRequest: true,
        }),
      });

      if (response.ok) {
        const text = await response.text();

        // Parse the response - handle both **Bold** and plain formats
        const newOverview: OverviewItem = {
          motivation: "",
          method: "",
          result: "",
          conclusion: ""
        };

        // Split by sections
        const sections = text.split(/\d+\.\s*\*\*|^\*\*|^\d+\./gm).filter(Boolean);

        // Try to parse each section - use [\s\S] instead of s flag
        const motivationMatch = text.match(/\*\*Motivation\*\*[:\s]*([\s\S]+?)(?=\*\*Method|\*\*Results|\*\*Conclusion|$)/i) ||
                             text.match(/Motivation[:\s]*([\s\S]+?)(?=\d+\.|\n\n|Metho|Result|Conclu|$)/i);
        const methodMatch = text.match(/\*\*Method\*\*[:\s]*([\s\S]+?)(?=\*\*Results|\*\*Conclusion|$)/i) ||
                          text.match(/Method[:\s]*([\s\S]+?)(?=\d+\.|\n\n|Result|Conclu|$)/i);
        const resultMatch = text.match(/\*\*Results?\*\*[:\s]*([\s\S]+?)(?=\*\*Conclusion|$)/i) ||
                          text.match(/Results?[:\s]*([\s\S]+?)(?=\d+\.|\n\n|Conclu|$)/i);
        const conclusionMatch = text.match(/\*\*Conclusion\*\*[:\s]*([\s\S]+)/i) ||
                              text.match(/Conclusion[:\s]*([\s\S]+)/i);

        if (motivationMatch) newOverview.motivation = motivationMatch[1].trim();
        if (methodMatch) newOverview.method = methodMatch[1].trim();
        if (resultMatch) newOverview.result = resultMatch[1].trim();
        if (conclusionMatch) newOverview.conclusion = conclusionMatch[1].trim();

        // Clean up - remove bullet points and extra formatting
        Object.keys(newOverview).forEach(key => {
          newOverview[key as keyof OverviewItem] = newOverview[key as keyof OverviewItem]
            .replace(/^\s*[-*•]\s*/gm, "")
            .replace(/\*\*/g, "")
            .replace(/^\s*\d+[.)]\s*/gm, "")
            .replace(/\n+/g, " ")
            .trim();
        });

        // Only save if we have content
        if (newOverview.motivation || newOverview.method || newOverview.result || newOverview.conclusion) {
          setOverview(newOverview);
          localStorage.setItem(`overview_${paper.id}`, JSON.stringify(newOverview));
          // Auto-translate
          translateOverview(newOverview);
        }
      }
    } catch (error) {
      console.error("Overview generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const translateOverview = async (overviewData: OverviewItem) => {
    setIsTranslating(true);

    try {
      // Create a structured prompt for translation
      const translationPrompt = `请翻译以下论文速览内容为中文：

动机：${overviewData.motivation}
方法：${overviewData.method}
结果：${overviewData.result}
结论：${overviewData.conclusion}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperTitle: paper.title,
          paperAbstract: translationPrompt,
          isTranslationRequest: true,
        }),
      });

      if (response.ok) {
        const text = await response.text();
        const newTranslation: Translation = {
          motivation: "",
          method: "",
          result: "",
          conclusion: ""
        };

        // Parse by looking for section headers - use [\s\S] instead of s flag
        const motivationMatch = text.match(/动机[：:]\s*([\s\S]+?)(?=方法[：:]|$)/);
        const methodMatch = text.match(/方法[：:]\s*([\s\S]+?)(?=结果[：:]|$)/);
        const resultMatch = text.match(/结果[：:]\s*([\s\S]+?)(?=结论[：:]|$)/);
        const conclusionMatch = text.match(/结论[：:]\s*([\s\S]+)/);

        if (motivationMatch) newTranslation.motivation = motivationMatch[1].trim();
        if (methodMatch) newTranslation.method = methodMatch[1].trim();
        if (resultMatch) newTranslation.result = resultMatch[1].trim();
        if (conclusionMatch) newTranslation.conclusion = conclusionMatch[1].trim();

        // Clean up
        Object.keys(newTranslation).forEach(key => {
          newTranslation[key as keyof Translation] = newTranslation[key as keyof Translation]
            .replace(/^[:：]\s*/, "")
            .trim();
        });

        setTranslation(newTranslation);
        localStorage.setItem(`overview_translation_${paper.id}`, JSON.stringify(newTranslation));
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!paper.abstract) {
    return <p className="text-sm text-muted-foreground">暂无摘要</p>;
  }

  return (
    <div>
      {!overview && (
        <div className="text-center py-8">
          <button
            onClick={generateOverview}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <FileQuestion className="h-4 w-4" />
                生成速览
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            点击生成论文的动机、方法、结果、结论速览
          </p>
        </div>
      )}

      {overview && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>速览已生成</span>
            {isTranslating && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                翻译中...
              </span>
            )}
            <button
              onClick={generateOverview}
              disabled={isLoading}
              className="text-primary hover:text-primary/80"
            >
              重新生成
            </button>
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-2 gap-3">
            <OverviewBox
              icon={<Target className="h-4 w-4" />}
              title="Motivation"
              titleZh="研究动机"
              content={overview.motivation}
              translation={translation?.motivation}
              color="#f59e0b"
            />
            <OverviewBox
              icon={<FlaskConical className="h-4 w-4" />}
              title="Method"
              titleZh="研究方法"
              content={overview.method}
              translation={translation?.method}
              color="#3b82f6"
            />
            <OverviewBox
              icon={<BarChart3 className="h-4 w-4" />}
              title="Results"
              titleZh="研究结果"
              content={overview.result}
              translation={translation?.result}
              color="#10b981"
            />
            <OverviewBox
              icon={<CheckCircle className="h-4 w-4" />}
              title="Conclusion"
              titleZh="研究结论"
              content={overview.conclusion}
              translation={translation?.conclusion}
              color="#8b5cf6"
            />
          </div>
        </div>
      )}
    </div>
  );
}
