"use client";

import Link from "next/link";
import { Paper } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface RelatedPapersProps {
  currentPaper: Paper;
  allPapers: Paper[];
}

export function RelatedPapers({ currentPaper, allPapers }: RelatedPapersProps) {
  // Find related papers based on tags and authors
  const relatedPapers = allPapers
    .filter((paper) => paper.id !== currentPaper.id)
    .map((paper) => {
      let score = 0;

      // Same source
      if (paper.source === currentPaper.source) score += 1;

      // Shared tags
      const sharedTags = paper.tags.filter((tag) =>
        currentPaper.tags.includes(tag)
      );
      score += sharedTags.length * 2;

      // Shared authors
      const sharedAuthors = paper.authors.filter((author) =>
        currentPaper.authors.includes(author)
      );
      score += sharedAuthors.length * 3;

      return { paper, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.paper);

  if (relatedPapers.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          相关论文
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {relatedPapers.map((paper) => (
          <Link
            key={paper.id}
            href={`/paper/${paper.id}`}
            className="block p-2 rounded-md hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium line-clamp-1 hover:text-primary">
                  {paper.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {paper.authors.slice(0, 2).join(", ")}
                </p>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
