import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Event, RsvpCounts, RsvpStatus } from "@/types";
import { deleteEvent, fetchEvent } from "@/api/events";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { RsvpButtons } from "@/components/events/RsvpButtons";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const eventId = Number(id);

  useEffect(() => {
    if (!id || Number.isNaN(eventId) || eventId <= 0) {
      setFetchError("Event not found.");
      setLoading(false);
      return;
    }

    fetchEvent(eventId)
      .then(setEvent)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setFetchError("Event not found.");
        } else {
          setFetchError("Could not load this event. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [id, eventId]);

  async function handleDelete() {
    if (!event) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteEvent(event.id);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete the event.");
      setDeleting(false);
    }
  }

  const handleRsvpUpdate = useCallback(
    (rsvp_counts: RsvpCounts, my_rsvp: RsvpStatus | null) => {
      setEvent((prev) => (prev ? { ...prev, rsvp_counts, my_rsvp } : prev));
    },
    [],
  );

  const isOwner = Boolean(user && event && user.id === event.creator_id);
  const isPast = event ? new Date(event.start_at) < new Date() : false;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="font-mono text-sm text-[#777]">loading…</p>
      </div>
    );
  }

  if (fetchError || !event) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm text-[#777]">{fetchError ?? "Event not found."}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-[#111] underline underline-offset-4 hover:opacity-70"
        >
          ← Back to events
        </Link>
      </div>
    );
  }

  const rsvpCounts = event.rsvp_counts ?? { yes: 0, no: 0, maybe: 0 };
  const myRsvp = event.my_rsvp ?? null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/" className="font-mono text-xs text-[#777] hover:text-[#111]">
        ← Events
      </Link>

      <div className="mt-5 border border-[#DCDCDC] bg-white p-6">
        {/* Title + type badge */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-medium text-[#111]">{event.title}</h1>
          <Badge variant={event.type}>{event.type}</Badge>
        </div>

        {/* Meta */}
        <div className="mt-3 space-y-1">
          <p className="font-mono text-xs text-[#777]">{formatDate(event.start_at)}</p>
          {event.location && <p className="text-sm text-[#555]">{event.location}</p>}
          <p className="text-xs text-[#999]">by {event.creator_name}</p>
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#333]">
            {event.description}
          </p>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[#DCDCDC] px-2 py-0.5 font-mono text-[10px] text-[#777]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* RSVP — only for upcoming events */}
        {isPast ? (
          <div className="mt-6 border-t border-[#F0F0F0] pt-5">
            <p className="text-xs text-[#999]">
              This event has passed.
              {(rsvpCounts.yes + rsvpCounts.maybe) > 0 && (
                <span>
                  {" "}
                  {rsvpCounts.yes} went · {rsvpCounts.maybe} were maybe.
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-6 border-t border-[#F0F0F0] pt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-[#555]">Are you going?</p>
            <RsvpButtons
              eventId={event.id}
              counts={rsvpCounts}
              myRsvp={myRsvp}
              onUpdate={handleRsvpUpdate}
            />
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="mt-5 flex items-center gap-5 border-t border-[#F0F0F0] pt-4">
            <Link
              to={`/events/${event.id}/edit`}
              className="text-sm text-[#111] underline underline-offset-4 hover:opacity-70"
            >
              Edit
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-red-600 underline underline-offset-4 hover:opacity-70"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setDeleteError(null);
        }}
        title="Delete event?"
      >
        <p className="text-sm text-[#555]">
          <span className="font-medium text-[#111]">"{event.title}"</span> will be permanently
          removed. This cannot be undone.
        </p>
        {deleteError && <Alert message={deleteError} className="mt-3" />}
        <div className="mt-5 flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleDelete}
            loading={deleting}
            className="px-5 py-2"
          >
            Delete
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setConfirmDelete(false);
              setDeleteError(null);
            }}
            className="px-4 py-2"
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
