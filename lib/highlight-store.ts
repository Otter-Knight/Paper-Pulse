import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TextHighlight {
  id: string;
  paperId: string;
  text: string;
  selectedText: string;
  color: HighlightColor;
  note: string;
  position: number;
  createdAt: string;
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";

interface HighlightStore {
  highlights: TextHighlight[];
  addHighlight: (highlight: Omit<TextHighlight, "id" | "createdAt">) => void;
  updateHighlightNote: (id: string, note: string) => void;
  removeHighlight: (id: string) => void;
  getHighlightsForPaper: (paperId: string) => TextHighlight[];
  undoLastHighlight: (paperId: string) => void;
  clearHighlightsForPaper: (paperId: string) => void;
}

const colorStyles: Record<HighlightColor, { bg: string; border: string; light: string }> = {
  yellow: { bg: "bg-yellow-200/60", border: "border-yellow-400", light: "bg-yellow-50" },
  green: { bg: "bg-green-200/60", border: "border-green-400", light: "bg-green-50" },
  blue: { bg: "bg-blue-200/60", border: "border-blue-400", light: "bg-blue-50" },
  pink: { bg: "bg-pink-200/60", border: "border-pink-400", light: "bg-pink-50" },
  purple: { bg: "bg-purple-200/60", border: "border-purple-400", light: "bg-purple-50" },
};

export const HIGHLIGHT_COLORS: { id: HighlightColor; name: string; style: string }[] = [
  { id: "yellow", name: "黄色", style: "bg-yellow-200/60 border-yellow-400" },
  { id: "green", name: "绿色", style: "bg-green-200/60 border-green-400" },
  { id: "blue", name: "蓝色", style: "bg-blue-200/60 border-blue-400" },
  { id: "pink", name: "粉色", style: "bg-pink-200/60 border-pink-400" },
  { id: "purple", name: "紫色", style: "bg-purple-200/60 border-purple-400" },
];

export function getHighlightStyle(color: HighlightColor) {
  return colorStyles[color];
}

export const useHighlightStore = create<HighlightStore>()(
  persist(
    (set, get) => ({
      highlights: [],

      addHighlight: (highlight) => {
        const newHighlight: TextHighlight = {
          ...highlight,
          id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          highlights: [...state.highlights, newHighlight],
        }));
      },

      updateHighlightNote: (id, note) => {
        set((state) => ({
          highlights: state.highlights.map((h) =>
            h.id === id ? { ...h, note } : h
          ),
        }));
      },

      removeHighlight: (id) => {
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        }));
      },

      getHighlightsForPaper: (paperId) => {
        return get().highlights.filter((h) => h.paperId === paperId);
      },

      undoLastHighlight: (paperId) => {
        const paperHighlights = get().highlights.filter((h) => h.paperId === paperId);
        if (paperHighlights.length > 0) {
          const lastHighlight = paperHighlights[paperHighlights.length - 1];
          set((state) => ({
            highlights: state.highlights.filter((h) => h.id !== lastHighlight.id),
          }));
        }
      },

      clearHighlightsForPaper: (paperId) => {
        set((state) => ({
          highlights: state.highlights.filter((h) => h.paperId !== paperId),
        }));
      },
    }),
    {
      name: "paper-highlights",
    }
  )
);
