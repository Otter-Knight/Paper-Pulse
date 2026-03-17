"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, Loader2, ZoomIn, ZoomOut, Maximize2, Download, Highlighter, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Paper } from "@/lib/actions";
import { useHighlightStore, HIGHLIGHT_COLORS, HighlightColor } from "@/lib/highlight-store";

interface PDFViewerProps {
  paper: Paper;
}

// Colors for highlights
const COLORS = [
  { name: "yellow", bg: "bg-yellow-200/60", border: "border-yellow-400" },
  { name: "green", bg: "bg-green-200/60", border: "border-green-400" },
  { name: "blue", bg: "bg-blue-200/60", border: "border-blue-400" },
  { name: "pink", bg: "bg-pink-200/60", border: "border-pink-400" },
  { name: "purple", bg: "bg-purple-200/60", border: "border-purple-400" },
];

export function PDFViewer({ paper }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNoteMenu, setShowNoteMenu] = useState(false);

  // Check if this is an OpenReview paper (can't embed in iframe)
  const isOpenReview = paper.source === "openreview" || paper.pdfUrl?.includes("openreview.net");
  // For arXiv, convert PDF URL to embeddable format
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    // arXiv PDFs can be embedded
    if (url.includes("arxiv.org/pdf/")) {
      return url;
    }
    // OpenReview PDFs cannot be embedded in iframe
    return null;
  };

  const embedUrl = getEmbedUrl(paper.pdfUrl);

  const { getHighlightsForPaper, highlights } = useHighlightStore();
  const [paperHighlights, setPaperHighlights] = useState<any[]>([]);

  // Load highlights for this paper
  useEffect(() => {
    setPaperHighlights(getHighlightsForPaper(paper.id));
  }, [paper.id, getHighlightsForPaper, highlights]);

  // Load notes from localStorage
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem(`notes_${paper.id}`);
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notes:", e);
      }
    }
  }, [paper.id]);

  if (!paper.pdfUrl) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No PDF available for this paper</p>
          {paper.sourceUrl && (
            <a
              href={paper.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on {paper.source === "arxiv" ? "arXiv" : "OpenReview"}
            </a>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleFullscreen = () => {
    // For non-embedded PDFs, open in new tab
    if (!embedUrl) {
      window.open(paper.pdfUrl || paper.sourceUrl || "", "_blank");
      return;
    }
    const iframe = document.getElementById("pdf-frame");
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  const handleExportWithHighlights = () => {
    // Create a simple HTML export with highlights info
    const highlightsHtml = paperHighlights.map(h => {
      const color = COLORS.find(c => c.name === h.color) || COLORS[0];
      return `
        <div style="margin-bottom: 12px; padding: 10px; background: ${color.bg}; border-left: 3px solid ${color.border}; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px;">${h.selectedText}</p>
          ${h.note ? `<p style="margin: 4px 0 0; font-size: 12px; color: #666;">📝 ${h.note}</p>` : ''}
          <small style="color: #999; font-size: 11px;">${new Date(h.createdAt).toLocaleDateString()}</small>
        </div>
      `;
    }).join("");

    const notesHtml = notes.map(n => {
      const color = COLORS.find(c => c.name === n.color) || COLORS[0];
      return `
        <div style="margin-bottom: 12px; padding: 10px; background: ${color.bg}; border-left: 3px solid ${color.border}; border-radius: 4px;">
          <small style="color: #666; font-size: 11px;">[${n.position}]</small>
          <p style="margin: 4px 0 0; font-size: 13px;">${n.content}</p>
          <small style="color: #999; font-size: 11px;">${new Date(n.createdAt).toLocaleDateString()}</small>
        </div>
      `;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paper.title} - Highlights & Notes</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #ffffff; color: #1a1a1a; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
          h2 { font-size: 16px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
          .yellow { background: #fef9c3; border-left-color: #eab308; }
          .green { background: #dcfce7; border-left-color: #22c55e; }
          .blue { background: #dbeafe; border-left-color: #3b82f6; }
          .pink { background: #fce7f3; border-left-color: #ec4899; }
          .purple { background: #f3e8ff; border-left-color: #a855f7; }
        </style>
      </head>
      <body>
        <h1>${paper.title}</h1>
        <p class="meta">Authors: ${paper.authors.join(", ")}</p>

        ${highlightsHtml ? `<h2>📌 Highlights (${paperHighlights.length})</h2><div class="highlights">${highlightsHtml}</div>` : ''}
        ${notesHtml ? `<h2>📝 Notes (${notes.length})</h2><div class="notes">${notesHtml}</div>` : ''}

        ${!highlightsHtml && !notesHtml ? '<p style="color: #666;">No highlights or notes yet.</p>' : ''}
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
    setShowExportMenu(false);
  };

  const handleExportNotesOnly = () => {
    const notesHtml = notes.map(n => {
      const color = COLORS.find(c => c.name === n.color) || COLORS[0];
      return `
        <div style="margin-bottom: 12px; padding: 10px; background: ${color.bg}; border-left: 3px solid ${color.border}; border-radius: 4px;">
          <small style="color: #666; font-size: 11px;">[${n.position}]</small>
          <p style="margin: 4px 0 0; font-size: 13px;">${n.content}</p>
          <small style="color: #999; font-size: 11px;">${new Date(n.createdAt).toLocaleDateString()}</small>
        </div>
      `;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paper.title} - Notes</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; background: #ffffff; color: #1a1a1a; }
          h1 { font-size: 20px; }
          .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
        </style>
      </head>
      <body>
        <h1>${paper.title}</h1>
        <p class="meta">我的笔记 (My Notes)</p>
        ${notesHtml || '<p>No notes yet.</p>'}
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
    setShowExportMenu(false);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">PDF</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Notes count */}
          {notes.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground mr-2">
              <StickyNote className="h-3 w-3" />
              <span>{notes.length}</span>
            </div>
          )}

          {/* Highlights count */}
          {paperHighlights.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground mr-2">
              <Highlighter className="h-3 w-3" />
              <span>{paperHighlights.length}</span>
            </div>
          )}

          {/* Export button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-7"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={notes.length === 0 && paperHighlights.length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              导出
            </Button>

            {showExportMenu && (notes.length > 0 || paperHighlights.length > 0) && (
              <div className="absolute top-full right-0 mt-1 p-2 card shadow-lg z-10 min-w-[160px] animate-fade-in">
                {paperHighlights.length > 0 && (
                  <button
                    onClick={handleExportWithHighlights}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-secondary rounded flex items-center gap-1"
                  >
                    <Highlighter className="h-3 w-3" />
                    带高亮导出
                  </button>
                )}
                {notes.length > 0 && (
                  <button
                    onClick={handleExportNotesOnly}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-secondary rounded flex items-center gap-1"
                  >
                    <StickyNote className="h-3 w-3" />
                    仅导出笔记
                  </button>
                )}
                {paperHighlights.length === 0 && notes.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-1">暂无内容可导出</p>
                )}
              </div>
            )}
          </div>

          {/* Only show zoom controls for embeddable PDFs */}
          {embedUrl && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs w-10 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-1"
            onClick={handleFullscreen}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 relative bg-muted/10 min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* OpenReview or non-embeddable PDF - show link */}
        {isOpenReview || !embedUrl ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-3">
                {isOpenReview ? "OpenReview 论文请在新窗口中打开" : "无法嵌入显示此 PDF"}
              </p>
              <a
                href={paper.pdfUrl || paper.sourceUrl || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                在新窗口中打开 PDF
              </a>
              {paper.sourceUrl && (
                <a
                  href={paper.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  或在 {paper.source === "openreview" ? "OpenReview" : "来源网站"} 查看
                </a>
              )}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in new tab
              </a>
            </div>
          </div>
        ) : (
          <iframe
            id="pdf-frame"
            src={`${embedUrl}#zoom=${zoom}`}
            className="w-full h-full min-h-[500px]"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError("Failed to load PDF");
            }}
            title={paper.title}
          />
        )}
      </div>

      {/* PDF Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-secondary/30">
        <span className="text-xs text-muted-foreground">
          使用缩放控件调整大小
        </span>
        <a
          href={paper.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          新窗口打开
        </a>
      </div>
    </Card>
  );
}
