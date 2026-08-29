import { memo } from "react";
import { Link } from "react-router-dom";
import type { Event } from "@/types";
import { Badge } from "@/components/ui/Badge";

type EventCardProps = {
  event: Event;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const EventCard = memo(function EventCard({ event }: EventCardProps) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="block border border-[#DCDCDC] bg-white p-5 transition-colors hover:border-[#111]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-medium text-[#111]">{event.title}</h2>
        <Badge variant={event.type}>{event.type}</Badge>
      </div>

      <p className="mt-1.5 font-mono text-xs text-[#777]">{formatDate(event.start_at)}</p>

      {event.location && <p className="mt-1 text-sm text-[#555]">{event.location}</p>}

      {event.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="border border-[#E8E8E8] px-2 py-0.5 font-mono text-[10px] text-[#777]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
});
