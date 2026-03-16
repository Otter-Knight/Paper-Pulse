import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReadRecord {
  paperId: string;
  readAt: string; // ISO date string
}

interface ReadHistoryStore {
  readPapers: ReadRecord[];
  markAsRead: (paperId: string) => void;
  isRecentlyRead: (paperId: string, days: number) => boolean;
  getReadPapersCount: () => number;
  clearHistory: () => void;
}

export const useReadHistoryStore = create<ReadHistoryStore>()(
  persist(
    (set, get) => ({
      readPapers: [],

      markAsRead: (paperId) => {
        set((state) => {
          // Remove existing record if any
          const filtered = state.readPapers.filter((r) => r.paperId !== paperId);
          return {
            readPapers: [
              ...filtered,
              {
                paperId,
                readAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      isRecentlyRead: (paperId, days = 7) => {
        const record = get().readPapers.find((r) => r.paperId === paperId);
        if (!record) return false;

        const readDate = new Date(record.readAt);
        const now = new Date();
        const diffDays = (now.getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24);

        return diffDays < days;
      },

      getReadPapersCount: () => {
        return get().readPapers.length;
      },

      clearHistory: () => {
        set({ readPapers: [] });
      },
    }),
    {
      name: "paper-read-history",
    }
  )
);
