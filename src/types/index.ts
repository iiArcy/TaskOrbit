// Profile type (extends Supabase auth.users)
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Board type
export interface Board {
  id: string;
  title: string;
  background: string;
  owner_id: string;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// List type
export interface List {
  id: string;
  title: string;
  position: string;
  board_id: string;
  created_at: string;
  updated_at: string;
}

// Card type
export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: string;
  due_date: string | null;
  list_id: string;
  created_at: string;
  updated_at: string;
}

// Board with nested lists and cards
export interface BoardWithDetails extends Board {
  lists: ListWithCards[];
}

// List with nested cards
export interface ListWithCards extends List {
  cards: Card[];
}

// Realtime payload types
export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

export interface RealtimePayload<T = unknown> {
  commit_timestamp: string;
  eventType: RealtimeEvent;
  new: T;
  old: T;
  schema: string;
  table: string;
}
