"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, StickyNote, Download, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PaperNote {
  id: string;
  content: string;
  position: "beginning" | "end";
  color: string;
  createdAt: string;
}

interface StickyNotePanelProps {
  paperId: string;
  paperTitle: string;
  paperAuthors?: string[];
}

type NotePosition = "beginning" | "end";

const POSITIONS: { id: NotePosition; label: string }[] = [
  { id: "beginning", label: "开头" },
  { id: "end", label: "结尾" },
];

const COLORS = [
  { name: "yellow", bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-700", lightBg: "bg-yellow-50" },
  { name: "pink", bg: "bg-pink-500/20", border: "border-pink-500/50", text: "text-pink-700", lightBg: "bg-pink-50" },
  { name: "blue", bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-700", lightBg: "bg-blue-50" },
  { name: "green", bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-700", lightBg: "bg-green-50" },
  { name: "purple", bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-700", lightBg: "bg-purple-50" },
];

export function StickyNotePanel({ paperId, paperTitle, paperAuthors = [] }: StickyNotePanelProps) {
  const [notes, setNotes] = useState<PaperNote[]>([]);
  const [summary, setSummary] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [selectedPosition, setSelectedPosition] = useState<NotePosition>("beginning");
  const [filterPosition, setFilterPosition] = useState<NotePosition | "all">("all");
  const [activeTab, setActiveTab] = useState<"notes" | "summary">("notes");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeNotes: true,
    includeSummary: true,
  });
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem(`notes_${paperId}`);
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes));
      } catch (e) {
        console.error("Failed to parse notes:", e);
      }
    }

    // Load summary
    const storedSummary = localStorage.getItem(`summary_${paperId}`);
    if (storedSummary) {
      try {
        setSummary(storedSummary);
      } catch (e) {
        console.error("Failed to parse summary:", e);
      }
    }
  }, [paperId]);

  // Save notes to localStorage
  const saveNotes = (newNotes: PaperNote[]) => {
    localStorage.setItem(`notes_${paperId}`, JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  // Save summary to localStorage
  const saveSummary = (newSummary: string) => {
    localStorage.setItem(`summary_${paperId}`, newSummary);
    setSummary(newSummary);
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
    const colorMap: Record<string, { lightBg: string; text: string }> = {
      yellow: { lightBg: "#fefce8", text: "#eab308" },
      pink: { lightBg: "#fdf2f8", text: "#ec4899" },
      blue: { lightBg: "#eff6ff", text: "#3b82f6" },
      green: { lightBg: "#f0fdf4", text: "#22c55e" },
      purple: { lightBg: "#faf5ff", text: "#a855f7" },
    };

    // Generate notes HTML if option selected
    let notesHtml = "";
    if (exportOptions.includeNotes && notes.length > 0) {
      notesHtml = `
        <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e5e5;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1a1a1a;">📝 我的笔记</h2>
          <div>
            ${notes.map((note) => {
              const color = colorMap[note.color] || colorMap.yellow;
              const posLabel = note.position === "beginning" ? "开头" : "结尾";
              return `
                <div style="margin-bottom: 12px; padding: 12px; background: ${color.lightBg}; border-left: 3px solid ${color.text}; border-radius: 6px;">
                  <small style="color: ${color.text}; font-size: 11px; font-weight: 500;">[${posLabel}]</small>
                  <p style="margin: 6px 0 0; color: #1a1a1a; font-size: 13px; line-height: 1.6;">${note.content}</p>
                  <small style="color: #6b6b6b; font-size: 11px;">${new Date(note.createdAt).toLocaleDateString()}</small>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    // Generate summary HTML if option selected
    let summaryHtml = "";
    if (exportOptions.includeSummary && summary.trim()) {
      summaryHtml = `
        <div style="margin-top: 32px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1a1a1a;">💡 读后总结</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${summary}</p>
        </div>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paperTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap');
          body {
            font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 48px;
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
          }
          h1 { font-size: 22px; font-weight: 600; margin-bottom: 8px; }
          .meta { color: #6b6b6b; font-size: 14px; margin-bottom: 32px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #374151; }
        </style>
      </head>
      <body>
        <h1>${paperTitle}</h1>
        <p class="meta">${paperAuthors.join(", ")}</p>

        ${notesHtml || ""}
        ${summaryHtml || ""}

        <div style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; text-align: center; color: #9ca3af; font-size: 12px;">
          由 Paper Pulse 生成 · ${new Date().toLocaleDateString()}
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
    setShowExportModal(false);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1 bg-secondary rounded-md p-0.5">
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-3 py-1.5 text-xs rounded flex items-center gap-1.5 transition-colors ${
                  activeTab === "notes" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <StickyNote className="h-3.5 w-3.5" />
                笔记
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1.5 text-xs rounded flex items-center gap-1.5 transition-colors ${
                  activeTab === "summary" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                读后总结
              </button>
            </div>

            {activeTab === "notes" && notes.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExportModal(true)}
                className="h-7 px-2 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                导出
              </Button>
            )}
          </div>

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <>
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
                    className={`px-2 py-1 text-xs rounded ${
                      filterPosition === pos.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              {isAdding && (
                <div className="mb-3 p-3 rounded-md bg-secondary/50 animate-fade-in">
                  <textarea
                    className="w-full h-20 p-2 rounded-md bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="写下你的思考..."
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

              {notes.length === 0 && !isAdding ? (
                <div className="text-center py-6 text-muted-foreground">
                  <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">暂无笔记</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdding(true)}
                    className="h-7 px-2 text-xs mt-1 text-primary"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    添加第一条笔记
                  </Button>
                </div>
              ) : (
                <>
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-xs">该位置暂无笔记</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {filteredNotes.map((note) => {
                        const color = COLORS.find((c) => c.name === note.color) || COLORS[0];
                        const posLabel = note.position === "beginning" ? "开头" : "结尾";
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
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-muted-foreground">
                        共 {notes.length} 条笔记
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="h-7 px-2 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        添加笔记
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                写下这篇论文的核心观点、你的思考或收获...
              </p>
              <textarea
                ref={summaryTextareaRef}
                className="w-full h-48 p-3 rounded-md bg-secondary/30 border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="在这篇文章中，作者提出了...&#10;&#10;我认为的核心亮点是...&#10;&#10;对我未来的研究方向的启发是..."
                value={summary}
                onChange={(e) => saveSummary(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {summary.length} 字符
                </p>
                {summary.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    导出总结
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
          <div className="bg-background rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">导出选项</h3>

            <div className="space-y-4 mb-6">
              {/* Include Notes Option */}
              <label className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <StickyNote className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">包含笔记</p>
                    <p className="text-xs text-muted-foreground">将你的批注渲染进 PDF</p>
                  </div>
                </div>
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, includeNotes: !prev.includeNotes }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    exportOptions.includeNotes ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    exportOptions.includeNotes ? "translate-x-5" : "translate-x-1"
                  }`} />
                </button>
              </label>

              {/* Include Summary Option */}
              <label className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">包含总结</p>
                    <p className="text-xs text-muted-foreground">将读后总结渲染进 PDF</p>
                  </div>
                </div>
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, includeSummary: !prev.includeSummary }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    exportOptions.includeSummary ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    exportOptions.includeSummary ? "translate-x-5" : "translate-x-1"
                  }`} />
                </button>
              </label>
            </div>

            {/* Quick Options */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">快捷选择</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportOptions({ includeNotes: false, includeSummary: false })}
                  className="flex-1 px-3 py-2 text-xs rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  纯净版
                </button>
                <button
                  onClick={() => setExportOptions({ includeNotes: true, includeSummary: true })}
                  className="flex-1 px-3 py-2 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  完整版
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)} className="flex-1">
                取消
              </Button>
              <Button onClick={handleExportPDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                导出 PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
