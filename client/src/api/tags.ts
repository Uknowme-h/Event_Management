import { api } from "@/api/client";

export type Tag = { id: number; name: string };

export async function fetchTags(): Promise<Tag[]> {
  const res = await api<{ data: Tag[] }>("/api/tags");
  return res.data;
}
