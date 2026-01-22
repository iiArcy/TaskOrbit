# Task Management MVP - Product Requirements Document

## Overview

A Trello-inspired task management application that allows users to organize work using boards, lists, and cards with drag-and-drop functionality.

**Project Type:** Learning / Portfolio
**Team Size:** Small team (2-3 developers)
**Timeline:** No hard deadline, quality over speed

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Backend/DB | Supabase (Postgres + Auth + Realtime) |
| Styling | Tailwind CSS + shadcn/ui |
| Drag & Drop | dnd-kit |
| State Management | Zustand |
| Deployment | Vercel |

---

## MVP Features

### 1. Authentication
- [x] Email/password sign up and sign in
- [ ] ~~OAuth (Google) sign in~~ — *Deferred to post-MVP*
- [x] Password reset flow
- [x] Protected routes

### 2. Boards
- [x] Create new board with title and color/gradient background
- [x] View all boards (grid layout)
- [x] Edit board title
- [x] Delete board (with confirmation) — *Soft delete, restorable within 30 days*
- [x] Board detail view showing all lists
- [x] Board color/gradient applied to header/banner area

### 3. Lists
- [x] Create new list within a board (click to reveal inline input)
- [x] Edit list title (inline editing)
- [x] Delete list (with confirmation, deletes all cards)
- [x] Reorder lists via drag-and-drop
- [x] Scrollable list with max height (independent scroll per list)

### 4. Cards
- [x] Create new card with inline input (press Enter to create)
- [x] Edit card title and description (plain text, no markdown)
- [x] Delete card (no confirmation, instant delete)
- [x] Drag-and-drop cards within a list
- [x] Drag-and-drop cards between lists
- [x] Card detail modal with:
  - Title
  - Description (plain text)
  - Due date

### 5. Real-time Updates
- [x] Live updates when collaborators modify boards/lists/cards
- [x] Optimistic UI updates for smooth UX

### 6. Keyboard Shortcuts (Basic)
- [x] `Escape` — Close modal
- [x] `Enter` — Save/submit
- [x] `N` — New card (when focused on a list)

---

## Deferred to Post-MVP

- OAuth (Google) sign in
- Labels/tags on cards
- Markdown support in descriptions
- Card comments
- Card attachments
- Activity log
- Board templates
- Full keyboard navigation
- Card checklists
- Search functionality
- Mobile-optimized experience
- Dark mode

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Visual style | Trello-like | Familiar Kanban look, colorful boards |
| Landing page | Basic (hero + features + CTA) | Quick to build, sets expectations |
| Card detail view | Modal overlay | Fast to open/close, board visible underneath |
| Data fetching | Mix (Server Actions + API Routes) | Server Actions for mutations, API routes for queries |
| Card creation | Inline input | Fast, low-friction card creation |
| Delete confirmation | Boards/lists only | Cards delete instantly, heavier objects confirm |
| Position tracking | Fractional indexing | Avoids reordering multiple rows on every move |
| Board background | Color + gradients (header only) | Visual variety without complexity |
| Error handling | Toast + inline | Inline for forms, toasts for async operations |
| List overflow | Scroll within list | Each list scrolls independently |
| Add list UI | Click to reveal input | Clean default state, inline editing |
| Board deletion | Soft delete (30 days) | Safety net for accidental deletes |
| Mobile | Desktop only | Scope constraint for MVP |
| Touch drag-and-drop | Nice to have | Not a blocker if it doesn't work perfectly |
| Testing | Critical path only | Auth flow + core CRUD operations |
| Accessibility | Basic | Semantic HTML, ARIA labels, keyboard-accessible modals |

---

## Data Models

### User (managed by Supabase Auth)
```sql
-- Supabase handles auth.users, we extend with profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Board
```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  background TEXT DEFAULT 'blue', -- color name or gradient key
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for soft delete queries
CREATE INDEX idx_boards_archived ON boards(owner_id, is_archived);
```

### List
```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  position TEXT NOT NULL, -- fractional index (e.g., 'a0', 'a0V')
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_board ON lists(board_id);
```

### Card
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  position TEXT NOT NULL, -- fractional index
  due_date TIMESTAMPTZ,
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cards_list ON cards(list_id);
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Boards: Users can only access their own boards
CREATE POLICY "Users can CRUD own boards" ON boards
  FOR ALL USING (auth.uid() = owner_id);

-- Lists: Users can access lists on their boards
CREATE POLICY "Users can CRUD lists on own boards" ON lists
  FOR ALL USING (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

-- Cards: Users can access cards in lists on their boards
CREATE POLICY "Users can CRUD cards on own boards" ON cards
  FOR ALL USING (
    list_id IN (
      SELECT l.id FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── boards/
│   │   │   ├── page.tsx              # Board list
│   │   │   └── [boardId]/page.tsx    # Board detail
│   │   ├── archived/page.tsx         # Archived boards
│   │   └── layout.tsx
│   ├── api/
│   │   ├── boards/route.ts
│   │   ├── lists/route.ts
│   │   └── cards/route.ts
│   ├── layout.tsx
│   └── page.tsx                      # Landing page
├── components/
│   ├── ui/                           # shadcn components
│   ├── board/
│   │   ├── BoardCard.tsx
│   │   ├── BoardGrid.tsx
│   │   ├── BoardHeader.tsx
│   │   └── CreateBoardDialog.tsx
│   ├── list/
│   │   ├── List.tsx
│   │   ├── ListHeader.tsx
│   │   ├── ListContainer.tsx
│   │   └── AddListButton.tsx
│   ├── card/
│   │   ├── Card.tsx
│   │   ├── CardModal.tsx
│   │   └── AddCardInput.tsx
│   ├── dnd/
│   │   ├── DndContext.tsx
│   │   ├── SortableList.tsx
│   │   └── SortableCard.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── ConfirmDialog.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts
│   ├── fractional-index.ts           # Position utilities
│   └── utils.ts
├── actions/
│   ├── boards.ts                     # Server actions for boards
│   ├── lists.ts                      # Server actions for lists
│   └── cards.ts                      # Server actions for cards
├── store/
│   └── boardStore.ts                 # Zustand store
├── types/
│   └── index.ts                      # TypeScript interfaces
└── hooks/
    ├── useBoards.ts
    ├── useLists.ts
    ├── useCards.ts
    ├── useRealtimeSubscription.ts
    └── useKeyboardShortcuts.ts
```

---

## API Design

### Server Actions (Mutations)

```typescript
// actions/boards.ts
'use server'
export async function createBoard(title: string, background: string): Promise<Board>
export async function updateBoard(id: string, updates: Partial<Board>): Promise<Board>
export async function archiveBoard(id: string): Promise<void>
export async function restoreBoard(id: string): Promise<void>
export async function deleteBoard(id: string): Promise<void> // permanent delete

// actions/lists.ts
'use server'
export async function createList(boardId: string, title: string): Promise<List>
export async function updateList(id: string, updates: Partial<List>): Promise<List>
export async function deleteList(id: string): Promise<void>
export async function reorderList(id: string, newPosition: string): Promise<void>

// actions/cards.ts
'use server'
export async function createCard(listId: string, title: string): Promise<Card>
export async function updateCard(id: string, updates: Partial<Card>): Promise<Card>
export async function deleteCard(id: string): Promise<void>
export async function moveCard(id: string, toListId: string, newPosition: string): Promise<void>
```

### API Routes (Queries)

```typescript
// GET /api/boards - Fetch all boards for current user
// GET /api/boards?archived=true - Fetch archived boards

// GET /api/boards/[id] - Fetch single board with lists and cards
```

---

## UI/UX Specifications

### Pages

#### 1. Landing Page (`/`)
- Hero section with headline and CTA buttons
- Brief features list (3-4 key features)
- Login/Signup buttons in header
- Redirect to `/boards` if authenticated

#### 2. Auth Pages (`/login`, `/signup`, `/forgot-password`)
- Clean, centered card layout
- Email/password form
- Link to alternate action (login ↔ signup)
- Error messages inline below fields

#### 3. Boards Page (`/boards`)
- Grid of board cards (responsive: 1-4 columns)
- Each card shows title and background color preview
- "Create new board" card with + icon
- Link to archived boards

#### 4. Board Detail Page (`/boards/[id]`)
- Header with board title (editable) and background color/gradient
- Horizontal scrolling container for lists
- Each list:
  - Header with title (inline editable) and menu (delete)
  - Scrollable card container (max-height with overflow)
  - "Add card" input at bottom (inline)
- "Add list" button at end (click to reveal input)
- Full drag-and-drop for lists and cards

#### 5. Card Modal
- Opens on card click (overlay, board visible behind)
- Close on Escape or click outside
- Editable title (inline)
- Description textarea (plain text, auto-save on blur)
- Due date picker
- Delete button (no confirmation)

### Background Options

```typescript
const BOARD_BACKGROUNDS = {
  // Solid colors
  blue: '#0079bf',
  green: '#519839',
  orange: '#d29034',
  red: '#b04632',
  purple: '#89609e',
  pink: '#cd5a91',

  // Gradients
  'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'gradient-sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'gradient-forest': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'gradient-fire': 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
} as const;
```

---

## Zustand Store

```typescript
// store/boardStore.ts
interface BoardState {
  // Data
  boards: Board[];
  archivedBoards: Board[];
  currentBoard: BoardWithDetails | null;
  isLoading: boolean;
  error: string | null;

  // Board actions
  fetchBoards: () => Promise<void>;
  fetchArchivedBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (title: string, background: string) => Promise<Board>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  archiveBoard: (id: string) => Promise<void>;
  restoreBoard: (id: string) => Promise<void>;

  // List actions (optimistic)
  addList: (list: List) => void;
  updateListLocal: (id: string, updates: Partial<List>) => void;
  removeList: (id: string) => void;
  reorderListsLocal: (activeId: string, overId: string) => void;

  // Card actions (optimistic)
  addCard: (card: Card) => void;
  updateCardLocal: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  moveCardLocal: (cardId: string, fromListId: string, toListId: string, newPosition: string) => void;

  // Real-time sync
  handleRealtimeUpdate: (payload: RealtimePayload) => void;
}
```

---

## Real-time Subscriptions

```typescript
// hooks/useRealtimeSubscription.ts
export function useRealtimeSubscription(boardId: string) {
  const { handleRealtimeUpdate } = useBoardStore();

  useEffect(() => {
    const channel = supabase
      .channel(`board-${boardId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lists',
        filter: `board_id=eq.${boardId}`
      }, handleRealtimeUpdate)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cards',
      }, handleRealtimeUpdate)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]);
}
```

---

## Fractional Indexing

Using a library like `fractional-indexing` for position values:

```typescript
import { generateKeyBetween } from 'fractional-indexing';

// Insert at end
const newPosition = generateKeyBetween(lastItem?.position ?? null, null);

// Insert between two items
const newPosition = generateKeyBetween(itemBefore.position, itemAfter.position);

// Insert at beginning
const newPosition = generateKeyBetween(null, firstItem?.position ?? null);
```

---

## Implementation Phases

### Phase 1: Foundation
1. Project setup (Next.js, TypeScript, Tailwind, shadcn/ui)
2. Supabase project creation
3. Database schema and RLS policies
4. Authentication (email/password, protected routes)
5. Basic layout (navbar, landing page)

### Phase 2: Core CRUD
1. Boards: create, list, view, edit, archive
2. Lists: create, edit, delete within board view
3. Cards: create (inline), edit (modal), delete
4. Zustand store setup

### Phase 3: Drag and Drop
1. dnd-kit setup and context provider
2. List reordering with fractional indexing
3. Card reordering within lists
4. Card moving between lists
5. Optimistic updates

### Phase 4: Polish
1. Real-time subscriptions
2. Keyboard shortcuts
3. Toast notifications and error handling
4. Loading states and skeletons
5. Basic tests for auth and CRUD

---

## Testing Strategy

### Critical Path Tests

1. **Authentication Flow**
   - Sign up with email/password
   - Login with valid credentials
   - Login with invalid credentials (error)
   - Password reset flow
   - Protected route redirects

2. **Board CRUD**
   - Create board
   - View boards list
   - Edit board title
   - Archive board
   - Restore board

3. **List CRUD**
   - Create list
   - Edit list title
   - Delete list

4. **Card CRUD**
   - Create card
   - Edit card in modal
   - Delete card
   - Move card between lists

---

## Success Criteria

- [ ] User can create an account and log in with email/password
- [ ] User can create, view, edit, and archive boards
- [ ] User can create, reorder, and delete lists
- [ ] User can create, edit, move, and delete cards
- [ ] Drag-and-drop works smoothly for lists and cards
- [ ] Changes persist to database
- [ ] Changes appear in real-time for other users viewing the same board
- [ ] Basic keyboard shortcuts work (Escape, Enter, N)
- [ ] Archived boards can be viewed and restored
