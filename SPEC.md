# Paper Pulse 3.0 - Specification Document

## 1. Project Overview

**Project Name:** Paper Pulse
**Type:** Web Application (Research Paper Discovery Platform)
**Core Functionality:** A daily research paper radar that helps users discover and engage with the latest papers from arXiv and OpenReview, with AI-powered summaries and chat capabilities.
**Target Users:** Researchers, academics, and students who want to stay updated with latest papers in their fields.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router, Server Components) |
| Language | TypeScript (Strict mode) |
| Styling | Tailwind CSS + Shadcn/UI |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| AI Integration | Vercel AI SDK (OpenAI) |
| State | React Context + Zustand |
| Deployment | Vercel |

---

## 3. UI/UX Specification

### 3.1 Color Palette

```css
--background: #0a0a0f
--foreground: #fafafa
--card: #12121a
--card-foreground: #fafafa
--primary: #6366f1 (Indigo)
--primary-foreground: #ffffff
--secondary: #1e1e2e
--secondary-foreground: #a1a1aa
--muted: #27272a
--muted-foreground: #71717a
--accent: #8b5cf6 (Violet)
--accent-foreground: #ffffff
--destructive: #ef4444
--border: #27272a
--ring: #6366f1
```

### 3.2 Typography

- **Font Family:** "Geist Sans" (Google Fonts) for body, "Geist Mono" for code/technical
- **Headings:**
  - H1: 3rem (48px), font-weight: 700
  - H2: 2rem (32px), font-weight: 600
  - H3: 1.5rem (24px), font-weight: 600
- **Body:** 1rem (16px), line-height: 1.6
- **Small:** 0.875rem (14px)

### 3.3 Layout Structure

#### Global Layout
- **Navbar:** Fixed top, height: 64px, glassmorphism effect
- **Main Content:** Max-width: 1400px, centered, padding: 24px
- **Footer:** Minimal, contains copyright and links

#### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 3.4 Page Layouts

#### Page 1: Home - Daily Paper Radar (/)
- **Header:** Date navigation (Previous Day / Next Day buttons), current date display
- **Content:** Masonry grid of Paper Cards (3 columns desktop, 2 tablet, 1 mobile)
- **Grid Gap:** 24px

#### Page 2: Personalized Feed (/feed)
- **Header:** "Your Personalized Feed" title
- **Floating Button:** "Edit Interests" (bottom-right, fixed position)
- **Content:** Same masonry grid as Home
- **Empty State:** Message when no papers match preferences

#### Page 3: Paper Detail (/paper/[id])
- **Desktop Layout:** 3-column (300px | flex-1 | 350px)
- **Tablet/Mobile:** Single column, stacked sections
- **Left Column:** Metadata (source, authors, published date, tags)
- **Middle Column:** Quick glance highlights, AI summary section
- **Right Column:** Chat interface

### 3.5 Components

#### PaperCard
- Background: `--card` color
- Border: 1px solid `--border`
- Border-radius: 12px
- Padding: 20px
- Hover: Slight lift (translateY -2px), border color change to `--primary`
- Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3)

#### Badge (Tags)
- Background: `--accent` with 20% opacity
- Text color: `--accent-foreground`
- Border-radius: 9999px (pill)
- Padding: 4px 12px
- Font-size: 12px

#### Button (Primary)
- Background: `--primary`
- Text: `--primary-foreground`
- Border-radius: 8px
- Padding: 10px 20px
- Hover: Brightness increase 10%

#### ChatMessage
- User: Align right, background `--primary`
- Assistant: Align left, background `--secondary`

---

## 4. Database Schema

### Papers Table
```sql
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  abstract TEXT,
  source VARCHAR(20) NOT NULL CHECK (source IN ('arxiv', 'openreview')),
  source_url TEXT,
  pdf_url TEXT,
  tags TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### UserPreferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE,
  keywords TEXT[] DEFAULT '{}',
  authors TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ChatHistory Table
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. API Routes & Server Actions

### Server Actions
- `getDailyPapers(date: Date)` - Fetch papers for a specific date
- `getPaperById(id: string)` - Fetch single paper details
- `getPersonalizedFeed(preferences: UserPreferences)` - Filter papers based on preferences
- `saveChatMessage(paperId: string, role: string, content: string)` - Save chat to DB

### API Routes
- `POST /api/cron/fetch-papers` - Trigger paper ingestion (protected by CRON_SECRET)
- `POST /api/chat` - Streaming chat endpoint using Vercel AI SDK

---

## 6. Functionality Specification

### Core Features

1. **Daily Paper Radar**
   - Fetch papers published on selected date
   - Display in responsive masonry grid
   - Date navigation (prev/next day)
   - Link to paper detail page

2. **Personalized Feed**
   - Load preferences from localStorage (MVP) or DB
   - Filter papers by keywords, authors, categories
   - "Edit Interests" modal with form
   - Save preferences to localStorage

3. **Paper Detail**
   - Display full paper metadata
   - Show AI-generated highlights (bullet points)
   - "Generate Deep Summary" button with streaming AI response
   - Chat interface with paper context

4. **AI Chat**
   - Send paper title + abstract + question to LLM
   - Stream response with typewriter effect
   - Save chat history to database

5. **Data Ingestion Pipeline**
   - Fetch from arXiv API (XML parsing)
   - Mock OpenReview data
   - Generate highlights and tags via LLM
   - Upsert to Supabase (prevent duplicates)

---

## 7. Environment Variables

```env
# Required
OPENAI_API_KEY="sk-..."
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."

# Optional
ANTHROPIC_API_KEY="sk-ant-..."
CRON_SECRET="my-secret-token"
USE_MOCK_DATA="true"
```

---

## 8. Project Structure

```
/app
  /layout.tsx          # Root layout with providers
  /page.tsx            # Home - Daily Paper Radar
  /feed/page.tsx       # Personalized Feed
  /paper/[id]/page.tsx # Paper Detail
  /api
    /cron/fetch-papers/route.ts
    /chat/route.ts
/components
  /ui/                 # Shadcn components
  /paper-card.tsx
  /date-nav.tsx
  /chat-interface.tsx
  /ai-summary.tsx
  /interests-modal.tsx
/lib
  /supabase.ts         # Supabase client
  /prisma.ts           # Prisma client
  /actions.ts          # Server actions
  /utils.ts            # Utility functions
  /mock-data.ts        # Mock paper data
/hooks
  /use-chat.ts         # Chat hook
/prisma
  /schema.prisma       # Database schema
```

---

## 9. Acceptance Criteria

- [ ] Home page loads with date navigation and paper grid
- [ ] Paper cards display title, authors (truncated), source icon, abstract (3 lines), tags
- [ ] Clicking "Read More" expands abstract
- [ ] Date navigation changes displayed papers
- [ ] Feed page shows filtered papers based on preferences
- [ ] "Edit Interests" opens modal with form
- [ ] Paper detail page shows 3-column layout (desktop)
- [ ] AI Summary button triggers streaming response
- [ ] Chat interface sends messages and displays responses
- [ ] Data ingestion API fetches from arXiv and saves to DB
- [ ] Mock data mode works when USE_MOCK_DATA=true
- [ ] Environment variables properly configured
- [ ] No TypeScript errors
- [ ] Responsive design works on mobile/tablet/desktop
