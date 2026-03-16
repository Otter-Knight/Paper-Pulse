"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLibraryStore, SavedPaper } from "@/lib/library-store";
import { FileText, Trash2, ExternalLink, Calendar, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LibraryPage() {
  const { savedPapers, removeFromLibrary } = useLibraryStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sort by saved date (most recent first)
  const sortedPapers = [...savedPapers].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {savedPapers.length} papers saved
          </p>
        </div>
      </div>

      {sortedPapers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No papers saved yet</h3>
          <p className="text-muted-foreground mb-4">
            Save papers from the daily feed to build your library
          </p>
          <Button asChild>
            <Link href="/">Browse Papers</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPapers.map((paper) => (
            <div
              key={paper.id}
              className="card p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge text-xs font-mono ${
                      paper.source === "arxiv"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {paper.source === "arxiv" ? "arXiv" : "OpenReview"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Saved {new Date(paper.savedAt).toLocaleDateString()}
                    </span>
                    {paper.notes.length > 0 && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <StickyNote className="w-3 h-3" />
                        {paper.notes.length} notes
                      </span>
                    )}
                  </div>

                  <Link href={`/paper/${paper.id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                      {paper.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {paper.authors.join(", ")}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {paper.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="badge text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/paper/${paper.id}`}>
                      <FileText className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  {paper.pdfUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromLibrary(paper.id)}
                    title="Remove from library"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
