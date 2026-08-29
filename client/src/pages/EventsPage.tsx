import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Event, EventListMeta } from "@/types";
import { fetchEvents } from "@/api/events";
import { fetchTags } from "@/api/tags";
import type { Tag } from "@/api/tags";
import { ApiError } from "@/api/client";
import { useEventFilters } from "@/hooks/useEventFilters";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { EventForm } from "@/components/events/EventForm";
import { Pagination } from "@/components/ui/Pagination";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";

const LIMIT = 10;
const TABS: { label: string; value: "upcoming" | "past" }[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
];

export function EventsPage() {
  const navigate = useNavigate();
  const { filters, setFilter, setPage } = useEventFilters();

  const [events, setEvents] = useState<Event[]>([]);
  const [meta, setMeta] = useState<EventListMeta>({ page: 1, limit: LIMIT, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bump this to force a list re-fetch after a new event is created
  const [refreshKey, setRefreshKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // New-event modal
  const [createOpen, setCreateOpen] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);

  // Fetch tag suggestions once (used by TagInput inside the modal form)
  useEffect(() => {
    fetchTags().then(setTagSuggestions).catch(() => {});
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    fetchEvents({
      status: filters.status,
      type: filters.type || undefined,
      tags: filters.tags || undefined,
      q: filters.q || undefined,
      page: filters.page,
      limit: LIMIT,
    })
      .then(({ data, meta: m }) => {
        if (ctrl.signal.aborted) return;
        setEvents(data);
        setMeta(m);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : "Could not load events.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [filters.status, filters.type, filters.tags, filters.q, filters.page, refreshKey]);

  const handleCreateSuccess = useCallback(
    (id: number) => {
      setCreateOpen(false);
      setRefreshKey((k) => k + 1);
      navigate(`/events/${id}`);
    },
    [navigate],
  );

  const handleCloseModal = useCallback(() => setCreateOpen(false), []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Page heading row */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-mono text-sm font-medium tracking-tight text-[#111]">Events</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="text-sm text-[#111] transition-opacity hover:opacity-60"
        >
          + New event
        </button>
      </div>

      {/* Status tabs */}
      <nav className="mb-6 flex items-center gap-6 border-b border-[#DCDCDC]">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter("status", value)}
            className={`pb-3 text-sm transition-colors ${
              filters.status === value
                ? "border-b-2 border-[#111] font-medium text-[#111]"
                : "text-[#777] hover:text-[#111]"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Filters */}
      <div className="mb-6">
        <EventFilters filters={filters} onFilter={setFilter} />
      </div>

      {/* Error */}
      {error && <Alert message={error} className="mb-6" />}

      {/* List */}
      {loading ? (
        <p className="font-mono text-sm text-[#777]">loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-[#777]">No events match these filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.total > 0 && (
        <div className="mt-8">
          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* New event modal */}
      <Modal
        open={createOpen}
        onClose={handleCloseModal}
        title="New event"
        size="lg"
      >
        <EventForm
          tagSuggestions={tagSuggestions.map((t) => t.name)}
          onSuccess={handleCreateSuccess}
          onCancel={handleCloseModal}
          compact
        />
      </Modal>
    </div>
  );
}
