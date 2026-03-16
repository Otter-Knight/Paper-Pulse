"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paper } from "@/lib/actions";

interface AISummaryProps {
  paper: Paper;
}

export function AISummary({ paper }: AISummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateSummary = async () => {
    if (isGenerated) {
      setExpanded(!expanded);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: paper.id,
          paperTitle: paper.title,
          paperAbstract: paper.abstract || "",
          question: "Provide a detailed summary of this paper including the main contributions, methodology, and key findings.",
          history: [],
          isSummaryRequest: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const text = await response.text();
      setSummary(text);
      setIsGenerated(true);
      setExpanded(true);
    } catch (err) {
      console.error("Summary error:", err);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paper.highlights.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Quick Glance
            </h4>
            <ul className="space-y-1.5">
              {paper.highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-xs text-secondary-foreground"
                >
                  <span className="text-primary">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={generateSummary}
          disabled={isLoading}
          variant="secondary"
          className="w-full h-8 text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              Generating...
            </>
          ) : isGenerated ? (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              {expanded ? "Hide" : "Show"} Summary
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Generate Summary
            </>
          )}
        </Button>

        {error && (
          <p className="text-xs text-destructive mt-3">{error}</p>
        )}

        {isGenerated && expanded && summary && (
          <div className="mt-4 p-3 rounded-md bg-secondary/50 animate-fade-in">
            <div className="prose prose-invert prose-xs max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xs font-semibold text-foreground mt-3 mb-1.5 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-semibold text-foreground mt-2 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs text-secondary-foreground mb-1.5">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-xs text-secondary-foreground mb-1.5 space-y-0.5">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-xs text-secondary-foreground mb-1.5 space-y-0.5">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-secondary-foreground">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-semibold">{children}</strong>
                  ),
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
