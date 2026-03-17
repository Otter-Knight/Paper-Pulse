import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PreferenceTagCard } from '@/components/preference-builder';

interface PreferenceState {
  cards: PreferenceTagCard[];
  selectedCardIds: string[];
  addCard: (card: PreferenceTagCard) => void;
  removeCard: (id: string) => void;
  toggleCardSelection: (id: string) => void;
  clearSelections: () => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      cards: [],
      selectedCardIds: [],

      addCard: (card) => set((state) => {
        if (state.cards.length >= 10) return state;
        // Check for duplicate by name
        if (state.cards.some(c => c.name === card.name)) return state;
        return { cards: [...state.cards, card] };
      }),

      removeCard: (id) => set((state) => ({
        cards: state.cards.filter(c => c.id !== id),
        selectedCardIds: state.selectedCardIds.filter(cid => cid !== id),
      })),

      toggleCardSelection: (id) => set((state) => ({
        selectedCardIds: state.selectedCardIds.includes(id)
          ? state.selectedCardIds.filter(cid => cid !== id)
          : [...state.selectedCardIds, id],
      })),

      clearSelections: () => set({ selectedCardIds: [] }),
    }),
    {
      name: 'paper-pulse-preferences',
    }
  )
);

// Helper to get all selected keywords from selected cards
export function getSelectedKeywords(cards: PreferenceTagCard[], selectedIds: string[]): string[] {
  const selectedCards = cards.filter(c => selectedIds.includes(c.id));
  const keywords = new Set<string>();
  selectedCards.forEach(card => {
    card.keywords.forEach(kw => keywords.add(kw));
  });
  return Array.from(keywords);
}

// Helper to get all selected venues from selected cards
export function getSelectedVenues(cards: PreferenceTagCard[], selectedIds: string[]): string[] {
  const selectedCards = cards.filter(c => selectedIds.includes(c.id));
  const venues = new Set<string>();
  selectedCards.forEach(card => {
    card.venues.forEach(v => {
      if (v) venues.add(v);
    });
  });
  return Array.from(venues);
}

// Helper to get all selected authors from selected cards
export function getSelectedAuthors(cards: PreferenceTagCard[], selectedIds: string[]): string[] {
  const selectedCards = cards.filter(c => selectedIds.includes(c.id));
  const authors = new Set<string>();
  selectedCards.forEach(card => {
    card.authors.forEach(a => {
      if (a) authors.add(a);
    });
  });
  return Array.from(authors);
}
