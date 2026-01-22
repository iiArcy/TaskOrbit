# Task Management MVP - Implementation Plan

## Overview

Building a Trello-inspired task management app from scratch. The project currently only contains `prd.md` - no code exists yet.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Supabase, Tailwind CSS, shadcn/ui, dnd-kit, Zustand

---

## Phase 1: Project Setup & Configuration

**Goal:** Initialize Next.js project with all dependencies and configuration files.

### Tasks
1. Initialize Next.js project with TypeScript and App Router
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
   ```

2. Install dependencies
   ```bash
   # Core
   npm install @supabase/supabase-js @supabase/ssr zustand

   # Drag and drop
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

   # Utilities
   npm install fractional-indexing clsx tailwind-merge

   # shadcn/ui setup
   npx shadcn@latest init
   npx shadcn@latest add button card dialog input label toast dropdown-menu
   ```

3. Create environment template (`.env.example`)
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

4. Set up project structure
   ```
   src/
   ├── actions/
   ├── components/
   ├── hooks/
   ├── lib/
   ├── store/
   └── types/
   ```

### Verification
- `npm run dev` starts without errors
- Tailwind styles work
- shadcn components render correctly

---

## Phase 2: Supabase Setup & Database Schema

**Goal:** Create Supabase project, set up database schema, and configure clients.

### Tasks
1. Create Supabase client utilities
   - `src/lib/supabase/client.ts` - Browser client
   - `src/lib/supabase/server.ts` - Server client
   - `src/lib/supabase/middleware.ts` - Auth middleware

2. Create database migration SQL
   - profiles table
   - boards table (with is_archived, background)
   - lists table (with TEXT position for fractional indexing)
   - cards table (with TEXT position)
   - All indexes

3. Create RLS policies SQL
   - Enable RLS on all tables
   - User can CRUD own boards
   - User can CRUD lists/cards on own boards

4. Create TypeScript types
   - `src/types/index.ts` - Board, List, Card, Profile interfaces

5. Create middleware for auth session refresh
   - `src/middleware.ts`

### Verification
- Supabase connection works
- Types match database schema
- Middleware refreshes session correctly

---

## Phase 3: Authentication

**Goal:** Implement email/password auth with protected routes.

### Tasks
1. Create auth layout
   - `src/app/(auth)/layout.tsx` - Centered card layout

2. Create signup page
   - `src/app/(auth)/signup/page.tsx`
   - Email/password form with validation
   - Sign up with Supabase Auth
   - Redirect to /boards on success

3. Create login page
   - `src/app/(auth)/login/page.tsx`
   - Email/password form
   - Sign in with Supabase Auth
   - Redirect to /boards on success

4. Create forgot password page
   - `src/app/(auth)/forgot-password/page.tsx`
   - Email input for password reset

5. Create auth callback route
   - `src/app/auth/callback/route.ts` - Handle email confirmations

6. Create protected dashboard layout
   - `src/app/(dashboard)/layout.tsx`
   - Check session, redirect to /login if not authenticated

7. Create Navbar component
   - `src/components/shared/Navbar.tsx`
   - Logo, user menu, sign out button

### Verification
- Can create new account
- Can log in with valid credentials
- Protected routes redirect to login
- Sign out works

---

## Phase 4: Landing Page & Basic Layout

**Goal:** Create landing page and dashboard shell.

### Tasks
1. Create landing page
   - `src/app/page.tsx`
   - Hero section with headline
   - 3-4 feature highlights
   - CTA buttons (Login/Sign Up)
   - Redirect to /boards if authenticated

2. Create boards page shell
   - `src/app/(dashboard)/boards/page.tsx`
   - Empty state for now

3. Create loading states
   - `src/components/shared/LoadingSpinner.tsx`

4. Set up toast provider
   - Configure shadcn toast in root layout

### Verification
- Landing page renders correctly
- Authenticated users redirect to /boards
- Navigation between pages works

---

## Phase 5: Board CRUD Operations

**Goal:** Implement create, read, update, archive for boards.

### Tasks
1. Create Zustand store
   - `src/store/boardStore.ts`
   - boards, archivedBoards, currentBoard, isLoading, error
   - fetchBoards, createBoard, updateBoard, archiveBoard, restoreBoard

2. Create board server actions
   - `src/actions/boards.ts`
   - createBoard, updateBoard, archiveBoard, restoreBoard, deleteBoard

3. Create board API route
   - `src/app/api/boards/route.ts` - GET all boards

4. Create board components
   - `src/components/board/BoardCard.tsx` - Card in grid
   - `src/components/board/BoardGrid.tsx` - Grid layout
   - `src/components/board/CreateBoardDialog.tsx` - Create modal with color/gradient picker

5. Create background constants
   - `src/lib/backgrounds.ts` - BOARD_BACKGROUNDS object

6. Implement boards list page
   - `src/app/(dashboard)/boards/page.tsx`
   - Fetch and display boards
   - Create new board button
   - Link to archived boards

7. Create archived boards page
   - `src/app/(dashboard)/archived/page.tsx`
   - Show archived boards
   - Restore/delete permanently

### Verification
- Can create board with title and background
- Boards display in grid
- Can edit board title
- Can archive and restore boards

---

## Phase 6: Board Detail View & Lists

**Goal:** Implement board detail page with list CRUD.

### Tasks
1. Create board detail API route
   - `src/app/api/boards/[boardId]/route.ts` - GET board with lists and cards

2. Create list server actions
   - `src/actions/lists.ts`
   - createList, updateList, deleteList, reorderList

3. Create fractional indexing utility
   - `src/lib/fractional-index.ts`
   - Wrapper around fractional-indexing library

4. Add list state to Zustand store
   - addList, updateListLocal, removeList, reorderListsLocal

5. Create list components
   - `src/components/list/List.tsx` - Single list container
   - `src/components/list/ListHeader.tsx` - Title with inline edit, delete menu
   - `src/components/list/ListContainer.tsx` - Scrollable card container
   - `src/components/list/AddListButton.tsx` - Click to reveal input

6. Create board detail page
   - `src/app/(dashboard)/boards/[boardId]/page.tsx`
   - BoardHeader with title, background
   - Horizontal scrolling list container
   - Render all lists

7. Create BoardHeader component
   - `src/components/board/BoardHeader.tsx`
   - Editable title
   - Background color/gradient display

8. Create ConfirmDialog component
   - `src/components/shared/ConfirmDialog.tsx`
   - Reusable confirmation modal

### Verification
- Board detail page loads with lists
- Can create new list
- Can edit list title inline
- Can delete list (with confirmation)
- Lists scroll horizontally

---

## Phase 7: Card CRUD Operations

**Goal:** Implement card creation, editing, and deletion.

### Tasks
1. Create card server actions
   - `src/actions/cards.ts`
   - createCard, updateCard, deleteCard, moveCard

2. Add card state to Zustand store
   - addCard, updateCardLocal, removeCard, moveCardLocal

3. Create card components
   - `src/components/card/Card.tsx` - Card display in list
   - `src/components/card/AddCardInput.tsx` - Inline input at list bottom
   - `src/components/card/CardModal.tsx` - Full edit modal

4. Implement CardModal
   - Editable title (inline)
   - Description textarea (plain text, auto-save on blur)
   - Due date picker
   - Delete button (instant, no confirm)
   - Close on Escape or outside click

5. Wire up cards in List component
   - Display cards
   - Add card input at bottom
   - Click card to open modal

### Verification
- Can create card with inline input
- Card modal opens on click
- Can edit title and description
- Can set due date
- Can delete card (instant)

---

## Phase 8: Drag and Drop

**Goal:** Implement drag-and-drop for lists and cards using dnd-kit.

### Tasks
1. Create DnD context provider
   - `src/components/dnd/DndContext.tsx`
   - Configure sensors (pointer, keyboard)
   - Handle drag start, over, end events

2. Create sortable components
   - `src/components/dnd/SortableList.tsx` - Draggable list wrapper
   - `src/components/dnd/SortableCard.tsx` - Draggable card wrapper

3. Implement list reordering
   - Drag lists horizontally
   - Update positions with fractional indexing
   - Optimistic update in store
   - Persist to database

4. Implement card reordering within list
   - Drag cards vertically within same list
   - Update positions
   - Optimistic update

5. Implement card moving between lists
   - Detect when card enters different list
   - Update list_id and position
   - Handle edge cases (empty lists, etc.)

6. Add visual feedback
   - Drag overlay
   - Drop indicators
   - Smooth animations

### Verification
- Can drag lists to reorder
- Can drag cards within list
- Can drag cards between lists
- Positions persist after refresh
- Animations are smooth

---

## Phase 9: Real-time Subscriptions

**Goal:** Implement live updates when data changes.

### Tasks
1. Create realtime hook
   - `src/hooks/useRealtimeSubscription.ts`
   - Subscribe to lists and cards changes for current board

2. Implement handleRealtimeUpdate in store
   - Handle INSERT, UPDATE, DELETE events
   - Update local state without refetching

3. Wire up subscription in board detail page
   - Subscribe on mount
   - Unsubscribe on unmount

4. Handle edge cases
   - Ignore own changes (optimistic already applied)
   - Handle conflicts gracefully

### Verification
- Open board in two tabs
- Changes in one tab appear in other
- No duplicate updates

---

## Phase 10: Keyboard Shortcuts & Polish

**Goal:** Add keyboard shortcuts, error handling, and final polish.

### Tasks
1. Create keyboard shortcuts hook
   - `src/hooks/useKeyboardShortcuts.ts`
   - Escape - close modal
   - Enter - save/submit
   - N - new card (when focused on list)

2. Improve error handling
   - Toast notifications for errors
   - Inline errors for forms
   - Graceful fallbacks

3. Add loading states
   - Skeleton loaders for boards grid
   - Skeleton loaders for lists
   - Button loading states

4. Improve accessibility
   - Semantic HTML
   - ARIA labels on interactive elements
   - Focus management in modals

5. Final cleanup
   - Remove console.logs
   - Code organization review
   - Performance check

### Verification
- Keyboard shortcuts work
- Errors display appropriately
- Loading states show during fetches
- Keyboard navigation works

---

## Phase 11: Testing

**Goal:** Add critical path tests.

### Tasks
1. Set up testing framework
   - Install Vitest or Jest
   - Configure for Next.js

2. Write authentication tests
   - Sign up flow
   - Login flow
   - Protected route redirect

3. Write CRUD tests
   - Board create/read/update/archive
   - List create/update/delete
   - Card create/update/delete/move

### Verification
- All tests pass
- Critical paths covered

---

## Files to Create/Modify

### Configuration (Phase 1)
- `package.json` (auto-generated)
- `tailwind.config.ts`
- `next.config.js`
- `.env.example`
- `tsconfig.json`

### Supabase (Phase 2)
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`
- `src/types/index.ts`
- `supabase/migrations/` (SQL files)

### Auth (Phase 3)
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/(dashboard)/layout.tsx`
- `src/components/shared/Navbar.tsx`

### UI (Phases 4-7)
- `src/app/page.tsx`
- `src/app/(dashboard)/boards/page.tsx`
- `src/app/(dashboard)/boards/[boardId]/page.tsx`
- `src/app/(dashboard)/archived/page.tsx`
- `src/components/board/*`
- `src/components/list/*`
- `src/components/card/*`
- `src/components/shared/*`

### State & Actions (Phases 5-7)
- `src/store/boardStore.ts`
- `src/actions/boards.ts`
- `src/actions/lists.ts`
- `src/actions/cards.ts`
- `src/app/api/boards/route.ts`
- `src/app/api/boards/[boardId]/route.ts`

### DnD (Phase 8)
- `src/components/dnd/DndContext.tsx`
- `src/components/dnd/SortableList.tsx`
- `src/components/dnd/SortableCard.tsx`
- `src/lib/fractional-index.ts`

### Real-time & Polish (Phases 9-10)
- `src/hooks/useRealtimeSubscription.ts`
- `src/hooks/useKeyboardShortcuts.ts`
- `src/lib/backgrounds.ts`

---

## Verification Strategy

After each phase:
1. Run `npm run dev` - no errors
2. Test the features added in that phase
3. Check browser console for errors
4. Verify database changes persist

End-to-end test flow:
1. Create account → Login → See empty boards
2. Create board → See in grid
3. Open board → Add lists → Add cards
4. Drag cards between lists
5. Edit card details
6. Open in second tab → Make change → See update in first tab
7. Archive board → Restore board
8. Sign out → Redirected to login
