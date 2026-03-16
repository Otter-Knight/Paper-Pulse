import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  source: "arxiv" | "openreview";
  sourceUrl: string;
  pdfUrl: string;
  tags: string[];
  highlights: string[];
  publishedAt: string;
  savedAt: string;
  notes: PaperNote[];
}

export interface PaperNote {
  id: string;
  content: string;
  position: "beginning" | "end" | "side";
  color: string;
  createdAt: string;
}

interface LibraryStore {
  savedPapers: SavedPaper[];
  addToLibrary: (paper: Omit<SavedPaper, "savedAt" | "notes">) => void;
  removeFromLibrary: (paperId: string) => void;
  addNote: (paperId: string, note: Omit<PaperNote, "id" | "createdAt">) => void;
  updateNote: (paperId: string, noteId: string, content: string) => void;
  deleteNote: (paperId: string, noteId: string) => void;
  isInLibrary: (paperId: string) => boolean;
  getPaperById: (paperId: string) => SavedPaper | undefined;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      savedPapers: [],

      addToLibrary: (paper) => {
        set((state) => ({
          savedPapers: [
            {
              ...paper,
              savedAt: new Date().toISOString(),
              notes: [],
            },
            ...state.savedPapers,
          ],
        }));
      },

      removeFromLibrary: (paperId) => {
        set((state) => ({
          savedPapers: state.savedPapers.filter((p) => p.id !== paperId),
        }));
      },

      addNote: (paperId, note) => {
        set((state) => ({
          savedPapers: state.savedPapers.map((p) =>
            p.id === paperId
              ? {
                  ...p,
                  notes: [
                    ...p.notes,
                    {
                      ...note,
                      id: crypto.randomUUID(),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updateNote: (paperId, noteId, content) => {
        set((state) => ({
          savedPapers: state.savedPapers.map((p) =>
            p.id === paperId
              ? {
                  ...p,
                  notes: p.notes.map((n) =>
                    n.id === noteId ? { ...n, content } : n
                  ),
                }
              : p
          ),
        }));
      },

      deleteNote: (paperId, noteId) => {
        set((state) => ({
          savedPapers: state.savedPapers.map((p) =>
            p.id === paperId
              ? {
                  ...p,
                  notes: p.notes.filter((n) => n.id !== noteId),
                }
              : p
          ),
        }));
      },

      isInLibrary: (paperId) => {
        return get().savedPapers.some((p) => p.id === paperId);
      },

      getPaperById: (paperId) => {
        return get().savedPapers.find((p) => p.id === paperId);
      },
    }),
    {
      name: "paper-library",
    }
  )
);
