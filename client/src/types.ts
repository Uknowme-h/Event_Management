export type User = {
  id: number;
  name: string;
  email: string;
};

export type RsvpStatus = "yes" | "no" | "maybe";

export type RsvpCounts = {
  yes: number;
  no: number;
  maybe: number;
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
  /** Only present on the detail endpoint response */
  rsvp_counts?: RsvpCounts;
  /** Only present on the detail endpoint response */
  my_rsvp?: RsvpStatus | null;
};

export type EventListMeta = {
  page: number;
  limit: number;
  total: number;
};
