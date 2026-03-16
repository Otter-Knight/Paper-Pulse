"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Highlighter, Undo2, Trash2, Download, Eye, EyeOff, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useHighlightStore,
  TextHighlight,
  HIGHLIGHT_COLORS,
  HighlightColor,
  getHighlightStyle,
} from "@/lib/highlight-store";

interface TextHighlighterProps {
  paperId: string;
  content: string;
  onExportWithHighlights?: (showHighlights: boolean) => void;
}

export function TextHighlighter({ paperId, content, onExportWithHighlights }: TextHighlighterProps) {
  const {
    getHighlightsForPaper,
    addHighlight,
    updateHighlightNote,
    removeHighlight,
    undoLastHighlight,
  } = useHighlightStore();

  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [selection, setSelection] = useState<{ text: string; position: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>("yellow");
  const [showHighlights, setShowHighlights] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHighlights(getHighlightsForPaper(paperId));
  }, [paperId, getHighlightsForPaper]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0);
        const container = contentRef.current;
        if (container && container.contains(range.commonAncestorContainer)) {
          // Calculate position relative to content
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(container);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          const position = preCaretRange.toString().length;

          setSelection({
            text: sel.toString().trim(),
            position,
          });
        }
      } else {
        setSelection(null);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const handleAddHighlight = useCallback(() => {
    if (!selection) return;

    addHighlight({
      paperId,
      text: content.substring(selection.position, selection.position + selection.text.length),
      selectedText: selection.text,
      color: selectedColor,
      note: "",
      position: selection.position,
    });

    setHighlights(getHighlightsForPaper(paperId));
    setSelection(null);

    // Clear selection
    window.getSelection()?.removeAllRanges();
  }, [selection, selectedColor, paperId, content, addHighlight, getHighlightsForPaper]);

  const handleUndo = () => {
    undoLastHighlight(paperId);
    setHighlights(getHighlightsForPaper(paperId));
  };

  const handleDeleteHighlight = (id: string) => {
    removeHighlight(id);
    setHighlights(getHighlightsForPaper(paperId));
  };

  const handleSaveNote = (highlightId: string) => {
    updateHighlightNote(highlightId, noteContent);
    setHighlights(getHighlightsForPaper(paperId));
    setEditingNote(null);
    setNoteContent("");
  };

  // Render content with highlights
  const renderHighlightedContent = () => {
    if (!showHighlights || highlights.length === 0) {
      return <div ref={contentRef} className="whitespace-pre-wrap">{content}</div>;
    }

    const sortedHighlights = [...highlights].sort((a, b) => a.position - b.position);
    const parts: { text: string; highlight?: TextHighlight; isHighlighted: boolean }[] = [];
    let lastEnd = 0;

    sortedHighlights.forEach((hl) => {
      // Add text before highlight
      if (hl.position > lastEnd) {
        parts.push({
          text: content.substring(lastEnd, hl.position),
          isHighlighted: false,
        });
      }

      // Add highlighted text
      parts.push({
        text: hl.selectedText,
        highlight: hl,
        isHighlighted: true,
      });

      lastEnd = hl.position + hl.text.length;
    });

    // Add remaining text
    if (lastEnd < content.length) {
      parts.push({
        text: content.substring(lastEnd),
        isHighlighted: false,
      });
    }

    return (
      <div ref={contentRef} className="whitespace-pre-wrap">
        {parts.map((part, i) =>
          part.isHighlighted && part.highlight ? (
            <span
              key={i}
              className={`relative px-0.5 rounded ${getHighlightStyle(part.highlight.color).bg} cursor-pointer`}
              onClick={() => {
                setEditingNote(part.highlight!.id);
                setNoteContent(part.highlight!.note);
              }}
              title={part.highlight.note || "点击添加笔记"}
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-secondary/50 rounded-md">
        {/* Highlight Button with Color Picker */}
        <div className="relative group">
          <Button
            variant="secondary"
            size="sm"
            disabled={!selection}
            onClick={handleAddHighlight}
            className="h-7"
          >
            <Highlighter className="h-3.5 w-3.5 mr-1" />
            高亮
          </Button>

          {/* Color Picker Dropdown */}
          {selection && (
            <div className="absolute top-full left-0 mt-1 p-2 card shadow-lg z-10 flex gap-1 animate-fade-in">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`
                    w-6 h-6 rounded-full border-2 transition-transform
                    ${color.style}
                    ${selectedColor === color.id ? "scale-110 ring-2 ring-offset-1 ring-ring" : ""}
                  `}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Undo */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUndo}
          disabled={highlights.length === 0}
          className="h-7"
        >
          <Undo2 className="h-3.5 w-3.5 mr-1" />
          撤销
        </Button>

        {/* Toggle Highlights */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowHighlights(!showHighlights)}
          className="h-7"
          title={showHighlights ? "隐藏高亮" : "显示高亮"}
        >
          {showHighlights ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Export */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="h-7"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            导出
          </Button>

          {showExportOptions && (
            <div className="absolute top-full right-0 mt-1 p-2 card shadow-lg z-10 min-w-[160px] animate-fade-in">
              <p className="text-xs text-muted-foreground mb-2">导出选项</p>
              <button
                onClick={() => {
                  onExportWithHighlights?.(true);
                  setShowExportOptions(false);
                }}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-secondary rounded"
              >
                带高亮导出
              </button>
              <button
                onClick={() => {
                  onExportWithHighlights?.(false);
                  setShowExportOptions(false);
                }}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-secondary rounded"
              >
                仅导出笔记
              </button>
              <button
                onClick={() => {
                  setShowExportOptions(false);
                }}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-secondary rounded"
              >
                仅导出文本
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {highlights.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {highlights.length} 个高亮
          </span>
        )}
      </div>

      {/* Content with Highlights */}
      <div className="text-sm leading-relaxed">
        {renderHighlightedContent()}
      </div>

      {/* Note Editor Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-4 w-full max-w-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">添加笔记</h3>
            </div>
            <textarea
              className="w-full h-24 p-2 rounded-md bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="写下你的想法..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              autoFocus
            />
            <div className="flex justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleDeleteHighlight(editingNote);
                  setEditingNote(null);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                删除
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingNote(null)}>
                  取消
                </Button>
                <Button size="sm" onClick={() => handleSaveNote(editingNote)}>
                  保存
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
