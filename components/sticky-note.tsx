"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, StickyNote, Download, AlignLeft, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PaperNote {
  id: string;
  content: string;
  position: "beginning" | "end" | "side";
  color: string;
  createdAt: string;
}

interface StickyNotePanelProps {
  paperId: string;
  paperTitle: string;
}

type NotePosition = "beginning" | "end" | "side";

const POSITIONS: { id: NotePosition; label: string; icon: React.ReactNode }[] = [
  { id: "beginning", label: "开头", icon: <AlignLeft className="h-3.5 w-3.5" /> },
  { id: "end", label: "结尾", icon: <AlignRight className="h-3.5 w-3.5" /> },
];

const COLORS = [
  { name: "yellow", bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-700", lightBg: "bg-yellow-50" },
  { name: "pink", bg: "bg-pink-500/20", border: "border-pink-500/50", text: "text-pink-700", lightBg: "bg-pink-50" },
  { name: "blue", bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-700", lightBg: "bg-blue-50" },
  { name: "green", bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-700", lightBg: "bg-green-50" },
  { name: "purple", bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-700", lightBg: "bg-purple-50" },
];

export function StickyNotePanel({ paperId, paperTitle }: StickyNotePanelProps) {
  const [notes, setNotes] = useState<PaperNote[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [selectedPosition, setSelectedPosition] = useState<NotePosition>("beginning");
  const [filterPosition, setFilterPosition] = useState<NotePosition | "all">("all");

  // Load notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`notes_${paperId}`);
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notes:", e);
      }
    }
  }, [paperId]);

  // Save notes to localStorage
  const saveNotes = (newNotes: PaperNote[]) => {
    localStorage.setItem(`notes_${paperId}`, JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const filteredNotes = filterPosition === "all"
    ? notes
    : notes.filter(n => n.position === filterPosition);

  const handleAddNote = () => {
    if (!newContent.trim()) return;

    const note: PaperNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: newContent,
      position: selectedPosition,
      color: selectedColor,
      createdAt: new Date().toISOString(),
    };

    saveNotes([...notes, note]);
    setNewContent("");
    setIsAdding(false);
    setSelectedColor("yellow");
  };

  const handleDeleteNote = (noteId: string) => {
    saveNotes(notes.filter(n => n.id !== noteId));
  };

  const handleExportPDF = () => {
    const annotationsHtml = notes
      .map((a) => {
        const color = COLORS.find((c) => c.name === a.color) || COLORS[0];
        const posLabel = POSITIONS.find(p => p.id === a.position)?.label || "侧边";
        return `
        <div style="margin-bottom: 12px; padding: 10px; background: ${color.lightBg}; border-left: 3px solid ${color.text}; border-radius: 4px;">
          <small style="color: ${color.text}; font-size: 11px; font-weight: 500;">[${posLabel}]</small>
          <p style="margin: 4px 0 0; color: #1a1a1a; font-size: 13px;">${a.content}</p>
          <small style="color: #6b6b6b; font-size: 11px;">${new Date(a.createdAt).toLocaleDateString()}</small>
        </div>
      `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paperTitle} - Notes</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; background: #ffffff; color: #1a1a1a; }
          h1 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
          .meta { color: #6b6b6b; font-size: 13px; margin-bottom: 24px; }
          .annotation { margin-bottom: 12px; padding: 10px; border-radius: 4px; }
          .yellow { background: #fefce8; border-left: 3px solid #eab308; }
          .pink { background: #fdf2f8; border-left: 3px solid #ec4899; }
          .blue { background: #eff6ff; border-left: 3px solid #3b82f6; }
          .green { background: #f0fdf4; border-left: 3px solid #22c55e; }
          .purple { background: #faf5ff; border-left: 3px solid #a855f7; }
          .note-content { margin: 0; color: #1a1a1a; font-size: 13px; }
          .note-date { color: #6b6b6b; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>${paperTitle}</h1>
        <p class="meta">我的笔记与想法 (My Notes & Ideas)</p>
        <div class="annotations">
          ${annotationsHtml || "<p style='color: #6b6b6b;'>No notes yet.</p>"}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            笔记
          </h3>
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              disabled={notes.length === 0}
              className="h-7 px-2 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              导出
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              添加
            </Button>
          </div>
        </div>

        {/* Filter by position */}
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setFilterPosition("all")}
            className={`px-2 py-1 text-xs rounded ${
              filterPosition === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            全部
          </button>
          {POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => setFilterPosition(pos.id)}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                filterPosition === pos.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {pos.icon}
              {pos.label}
            </button>
          ))}
        </div>

        {isAdding && (
          <div className="mb-3 p-3 rounded-md bg-secondary/50 animate-fade-in">
            <textarea
              className="w-full h-20 p-2 rounded-md bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="写下你的笔记..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              autoFocus
            />

            {/* Position selector */}
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">位置:</p>
              <div className="flex gap-1">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos.id)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                      selectedPosition === pos.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border"
                    }`}
                  >
                    {pos.icon}
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    className={`w-5 h-5 rounded-full ${color.bg} border border-border ${
                      selectedColor === color.name ? "ring-2 ring-ring" : ""
                    }`}
                    onClick={() => setSelectedColor(color.name)}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewContent("");
                  }}
                  className="h-7 text-xs"
                >
                  取消
                </Button>
                <Button size="sm" onClick={handleAddNote} className="h-7 text-xs">
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">暂无笔记</p>
            <p className="text-xs mt-1">点击"添加"开始记录</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-xs">该位置暂无笔记</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {filteredNotes.map((note) => {
              const color = COLORS.find((c) => c.name === note.color) || COLORS[0];
              const posLabel = POSITIONS.find(p => p.id === note.position)?.label || "侧边";
              return (
                <div
                  key={note.id}
                  className={`p-3 rounded-md ${color.bg} border-l-2 ${color.border} animate-fade-in`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <span className={`text-xs ${color.text} font-medium`}>
                        [{posLabel}]
                      </span>
                      <p className="text-xs mt-1 whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {notes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            共 {notes.length} 条笔记
          </p>
        )}
      </CardContent>
    </Card>
  );
}
