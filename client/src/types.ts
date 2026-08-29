export type User = {
  id: number;
  name: string;
  email: string;
};

export type Event = {
  id: number;
  creator_id: number;
  creator_name: string;
  title: string;
  description: string | null;
  start_at: string;
  location: string | null;
  type: "public" | "private";
  tags: string[];
  created_at?: string;
  updated_at?: string;
};

export type EventListMeta = {
  page: number;
  limit: number;
  total: number;
};
