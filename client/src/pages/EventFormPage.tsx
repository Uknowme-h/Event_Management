import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Event } from "@/types";
import { fetchEvent } from "@/api/events";
import { fetchTags } from "@/api/tags";
import type { Tag } from "@/api/tags";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { EventForm } from "@/components/events/EventForm";

export function EventFormPage() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [event, setEvent] = useState<Event | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  // Always fetch tag suggestions for the TagInput autocomplete
  useEffect(() => {
    fetchTags().then(setTagSuggestions).catch(() => {});
  }, []);

  // For edit mode: load the event and verify ownership
  useEffect(() => {
    if (!isEditing || !id) return;

    const eventId = Number(id);
    if (Number.isNaN(eventId) || eventId <= 0) {
      setError("Event not found.");
      setLoading(false);
      return;
    }

    fetchEvent(eventId)
      .then((e) => {
        if (e.creator_id !== user?.id) {
          // Show a clear message instead of a blank form
          setError("You can only edit your own events.");
        } else {
          setEvent(e);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setError("Event not found.");
        } else {
          setError("Could not load this event.");
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEditing, user?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="font-mono text-sm text-[#777]">loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm text-[#777]">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 font-mono text-2xl font-medium tracking-tight text-[#111]">
        {isEditing ? "Edit event" : "New event"}
      </h1>
      <EventForm
        event={event ?? undefined}
        tagSuggestions={tagSuggestions.map((t) => t.name)}
      />
    </div>
  );
}
