import { api } from "@/api/client";
import type { Event, EventListMeta, RsvpCounts, RsvpStatus } from "@/types";

export type EventFiltersParams = {
  status?: "upcoming" | "past";
  type?: "public" | "private";
  tags?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type EventBodyPayload = {
  title: string;
  description?: string;
  start_at: string;
  location?: string;
  type: "public" | "private";
  tags: string[];
};

export async function fetchEvents(
  filters: EventFiltersParams = {},
): Promise<{ data: Event[]; meta: EventListMeta }> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.tags) params.set("tags", filters.tags);
  if (filters.q) params.set("q", filters.q);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  return api<{ data: Event[]; meta: EventListMeta }>(`/api/events${qs ? `?${qs}` : ""}`);
}

export async function fetchEvent(id: number): Promise<Event> {
  const res = await api<{ data: Event }>(`/api/events/${id}`);
  return res.data;
}

export async function createEvent(body: EventBodyPayload): Promise<Event> {
  const res = await api<{ status: string; message: string; data: Event }>("/api/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateEvent(id: number, body: EventBodyPayload): Promise<Event> {
  const res = await api<{ status: string; message: string; data: Event }>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteEvent(id: number): Promise<void> {
  await api<null>(`/api/events/${id}`, { method: "DELETE" });
}

export type RsvpData = { rsvp_counts: RsvpCounts; my_rsvp: RsvpStatus | null };

export async function setRsvp(eventId: number, status: RsvpStatus): Promise<RsvpData> {
  const res = await api<{ status: string; data: RsvpData }>(`/api/events/${eventId}/rsvp`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function removeRsvp(eventId: number): Promise<RsvpData> {
  const res = await api<{ status: string; data: RsvpData }>(`/api/events/${eventId}/rsvp`, {
    method: "DELETE",
  });
  return res.data;
}
