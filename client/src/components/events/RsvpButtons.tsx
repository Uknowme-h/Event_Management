import { useState } from "react";
import { setRsvp, removeRsvp } from "@/api/events";
import { ApiError } from "@/api/client";
import type { RsvpCounts, RsvpStatus } from "@/types";

type RsvpButtonsProps = {
  eventId: number;
  counts: RsvpCounts;
  myRsvp: RsvpStatus | null;
  onUpdate: (counts: RsvpCounts, myRsvp: RsvpStatus | null) => void;
};

const OPTIONS: { status: RsvpStatus; label: string }[] = [
  { status: "yes", label: "Going" },
  { status: "maybe", label: "Maybe" },
  { status: "no", label: "Not going" },
];

export function RsvpButtons({ eventId, counts, myRsvp, onUpdate }: RsvpButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(status: RsvpStatus) {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // Clicking the active status toggles it off (removes RSVP)
      const result =
        myRsvp === status ? await removeRsvp(eventId) : await setRsvp(eventId, status);
      onUpdate(result.rsvp_counts, result.my_rsvp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ status, label }) => {
          const active = myRsvp === status;
          const count = counts[status];
          return (
            <button
              key={status}
              onClick={() => handleClick(status)}
              disabled={loading}
              aria-pressed={active}
              className={`flex items-center gap-2 border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#DCDCDC] bg-white text-[#555] hover:border-[#111] hover:text-[#111]"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`font-mono text-xs ${active ? "text-white/70" : "text-[#999]"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Spinner shown while a request is in-flight */}
        {loading && (
          <span className="self-center font-mono text-xs text-[#999]">saving…</span>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
