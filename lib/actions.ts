"use server";

import prisma from "./prisma";
import { getMockPapersByDate, getMockPaperById, getPersonalizedPapers, getAllPapers, mockUserPreferences } from "./mock-data";

// Environment check
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  source: string;
  sourceUrl: string | null;
  pdfUrl: string | null;
  tags: string[];
  highlights: string[];
  publishedAt: Date | null;
  createdAt: Date;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  keywords: string[];
  authors: string[];
  categories: string[];
}

function parsePaper(raw: any): Paper {
  return {
    id: raw.id,
    title: raw.title,
    authors: Array.isArray(raw.authors) ? raw.authors : [],
    abstract: raw.abstract ?? null,
    source: raw.source,
    sourceUrl: raw.sourceUrl ?? raw.source_url ?? null,
    pdfUrl: raw.pdfUrl ?? raw.pdf_url ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    publishedAt: raw.publishedAt ?? raw.published_at ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date(),
  };
}

export async function getDailyPapers(date: Date): Promise<Paper[]> {
  if (USE_MOCK_DATA) {
    const mockPapers = getMockPapersByDate(date);
    return mockPapers as unknown as Paper[];
  }

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  try {
    const papers = await prisma.paper.findMany({
      where: {
        publishedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });
    return papers.map(parsePaper);
  } catch (error) {
    console.error("Error fetching daily papers:", error);
    // Fallback to mock data on error
    const mockPapers = getMockPapersByDate(date);
    return mockPapers as unknown as Paper[];
  }
}

// Get all papers for feed (used for personalized feed)
export async function getAllPapersList(): Promise<Paper[]> {
  if (USE_MOCK_DATA) {
    const papers = getAllPapers();
    return papers as unknown as Paper[];
  }

  try {
    const papers = await prisma.paper.findMany({
      orderBy: {
        publishedAt: "desc",
      },
      take: 100,
    });
    return papers.map(parsePaper);
  } catch (error) {
    console.error("Error fetching all papers:", error);
    const papers = getAllPapers();
    return papers as unknown as Paper[];
  }
}

export async function getPaperById(id: string): Promise<Paper | null> {
  if (USE_MOCK_DATA) {
    const mockPaper = getMockPaperById(id);
    return mockPaper as unknown as Paper | null;
  }

  try {
    const paper = await prisma.paper.findUnique({
      where: { id },
    });
    return paper ? parsePaper(paper) : null;
  } catch (error) {
    console.error("Error fetching paper:", error);
    const mockPaper = getMockPaperById(id);
    return mockPaper as unknown as Paper | null;
  }
}

export async function getPersonalizedFeed(preferences: UserPreferences): Promise<Paper[]> {
  if (USE_MOCK_DATA) {
    const papers = getPersonalizedPapers(
      preferences.keywords,
      preferences.authors,
      preferences.categories
    );
    return papers as unknown as Paper[];
  }

  try {
    // Simple matching - in production, use embedding similarity
    const papers = await prisma.paper.findMany({
      where: {
        OR: [
          { tags: { hasSome: preferences.categories } },
          { authors: { hasSome: preferences.authors } },
        ],
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50,
    });

    // Filter by keywords (simple text match)
    const keywordFiltered = papers.filter((paper: any) => {
      if (preferences.keywords.length === 0) return true;
      const searchText = `${paper.title} ${paper.abstract || ""} ${paper.tags.join(" ")}`.toLowerCase();
      return preferences.keywords.some((kw) => searchText.includes(kw.toLowerCase()));
    });

    return keywordFiltered.map(parsePaper);
  } catch (error) {
    console.error("Error fetching personalized feed:", error);
    const papers = getPersonalizedPapers(
      preferences.keywords,
      preferences.authors,
      preferences.categories
    );
    return papers as unknown as Paper[];
  }
}

export async function saveChatMessage(
  paperId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    // Skip saving in mock mode
    return;
  }

  try {
    await prisma.chatHistory.create({
      data: {
        paperId,
        role,
        content,
      },
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
}

export async function getChatHistory(paperId: string): Promise<{ role: string; content: string; createdAt: Date }[]> {
  if (USE_MOCK_DATA) {
    return [];
  }

  try {
    const history = await prisma.chatHistory.findMany({
      where: { paperId },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true, createdAt: true },
    });
    return history;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (USE_MOCK_DATA) {
    return { userId, ...mockUserPreferences };
  }

  try {
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId },
    });
    if (!prefs) return null;
    return {
      userId: prefs.userId,
      keywords: prefs.keywords,
      authors: prefs.authors,
      categories: prefs.categories,
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return { userId, ...mockUserPreferences };
  }
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  if (USE_MOCK_DATA) {
    return;
  }

  try {
    await prisma.userPreferences.upsert({
      where: { userId: preferences.userId },
      update: {
        keywords: preferences.keywords,
        authors: preferences.authors,
        categories: preferences.categories,
      },
      create: {
        userId: preferences.userId,
        keywords: preferences.keywords,
        authors: preferences.authors,
        categories: preferences.categories,
      },
    });
  } catch (error) {
    console.error("Error saving user preferences:", error);
  }
}

// Annotation types and functions
export interface Annotation {
  id: string;
  paperId: string;
  content: string;
  color: string;
  position: number | null;
  pageNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAnnotations(paperId: string): Promise<Annotation[]> {
  // In mock mode, try to get from localStorage
  if (USE_MOCK_DATA) {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(`annotations_${paperId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }

  try {
    const annotations = await prisma.annotation.findMany({
      where: { paperId },
      orderBy: { createdAt: "asc" },
    });
    return annotations;
  } catch (error) {
    console.error("Error fetching annotations:", error);
    return [];
  }
}

export async function saveAnnotation(
  paperId: string,
  content: string,
  color: string = "yellow",
  position: number | null = null,
  pageNumber: number | null = null
): Promise<Annotation | null> {
  // In mock mode, save to localStorage
  if (USE_MOCK_DATA) {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`annotations_${paperId}`);
    let annotations: any[] = [];
    if (stored) {
      try {
        annotations = JSON.parse(stored);
      } catch {
        annotations = [];
      }
    }

    const newAnnotation = {
      id: `annotation_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      paperId,
      content,
      color,
      position,
      pageNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    annotations.push(newAnnotation);
    localStorage.setItem(`annotations_${paperId}`, JSON.stringify(annotations));
    return newAnnotation as Annotation;
  }

  try {
    const annotation = await prisma.annotation.create({
      data: {
        paperId,
        content,
        color,
        position,
        pageNumber,
      },
    });
    return annotation;
  } catch (error) {
    console.error("Error saving annotation:", error);
    return null;
  }
}

export async function updateAnnotation(
  id: string,
  content: string,
  color?: string
): Promise<Annotation | null> {
  if (USE_MOCK_DATA) {
    if (typeof window === "undefined") return null;
    // Find and update in localStorage
    const paperId = id.split('_')[1]; // Extract paperId from mock ID
    // This is a simplified version - in real app we'd need better ID handling
    return null;
  }

  try {
    const annotation = await prisma.annotation.update({
      where: { id },
      data: {
        content,
        ...(color && { color }),
      },
    });
    return annotation;
  } catch (error) {
    console.error("Error updating annotation:", error);
    return null;
  }
}

export async function deleteAnnotation(id: string): Promise<boolean> {
  if (USE_MOCK_DATA) {
    if (typeof window === "undefined") return false;
    return true;
  }

  try {
    await prisma.annotation.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return false;
  }
}
