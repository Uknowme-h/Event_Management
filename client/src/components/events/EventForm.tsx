import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Event } from "@/types";
import { createEvent, updateEvent } from "@/api/events";
import { ApiError } from "@/api/client";
import { eventBodySchema } from "@/schemas/event";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { TagInput } from "@/components/events/TagInput";

type FieldErrors = Partial<
  Record<"title" | "description" | "start_at" | "location" | "type" | "tags", string>
>;

type EventFormProps = {
  event?: Event;
  tagSuggestions?: string[];
  /**
   * Called after a successful create instead of navigating to the new event.
   * When omitted, the form navigates to /events/:id as usual.
   */
  onSuccess?: (id: number) => void;
  /**
   * Called when the user clicks Cancel instead of navigate(-1).
   * When omitted, the form falls back to navigate(-1).
   */
  onCancel?: () => void;
  /**
   * Compact two-column layout for use inside a modal.
   * Reduces vertical spacing and places Date & Time / Location side-by-side.
   */
  compact?: boolean;
};

/** Convert a Date to the value expected by <input type="datetime-local"> */
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** Convert a server ISO string to the value expected by <input type="datetime-local"> */
function isoToLocal(iso: string): string {
  return toDatetimeLocal(new Date(iso));
}

/** Earliest selectable datetime — now rounded up to the next minute */
function minDatetimeLocal(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  return toDatetimeLocal(now);
}

export function EventForm({
  event,
  tagSuggestions = [],
  onSuccess,
  onCancel,
  compact = false,
}: EventFormProps) {
  const navigate = useNavigate();
  const isEditing = Boolean(event);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startAt, setStartAt] = useState(event ? isoToLocal(event.start_at) : "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [type, setType] = useState<"public" | "private">(event?.type ?? "public");
  const [tags, setTags] = useState<string[]>(event?.tags ?? []);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleCancel() {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const result = eventBodySchema.safeParse({
      title,
      description,
      start_at: startAt,
      location,
      type,
      tags,
    });

    if (!result.success) {
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: result.data.title,
        description: result.data.description,
        start_at: new Date(result.data.start_at).toISOString(),
        location: result.data.location,
        type: result.data.type,
        tags: result.data.tags,
      };

      if (isEditing && event) {
        await updateEvent(event.id, payload);
        navigate(`/events/${event.id}`);
      } else {
        const created = await createEvent(payload);
        if (onSuccess) {
          onSuccess(created.id);
        } else {
          navigate(`/events/${created.id}`);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details?.length) {
          const errs: FieldErrors = {};
          for (const d of err.details) {
            const key = d.path as keyof FieldErrors;
            if (key) errs[key] = d.message;
          }
          setFieldErrors(errs);
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const gap = compact ? "space-y-4" : "space-y-6";

  return (
    <form onSubmit={handleSubmit} noValidate className={gap}>
      {formError && <Alert message={formError} />}

      <Input
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={fieldErrors.title}
        autoFocus={!isEditing}
        placeholder="Event title"
      />

      {/* Date & Time + Location — side-by-side in compact mode */}
      {compact ? (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date & Time"
            type="datetime-local"
            value={startAt}
            min={minDatetimeLocal()}
            onChange={(e) => setStartAt(e.target.value)}
            error={fieldErrors.start_at}
          />
          <Input
            label="Location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            error={fieldErrors.location}
            placeholder="Optional…"
          />
        </div>
      ) : (
        <>
          <Input
            label="Date & Time"
            type="datetime-local"
            value={startAt}
            min={minDatetimeLocal()}
            onChange={(e) => setStartAt(e.target.value)}
            error={fieldErrors.start_at}
          />
          <Input
            label="Location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            error={fieldErrors.location}
            placeholder="Optional location…"
          />
        </>
      )}

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.15em] text-[#555]">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={compact ? 2 : 3}
          placeholder="Optional description…"
          className={`w-full resize-y border-b bg-transparent py-2 text-sm placeholder:text-[#999] focus:outline-none transition-colors ${
            fieldErrors.description
              ? "border-red-400"
              : "border-[#E0E0E0] focus:border-[#111]"
          }`}
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-500">{fieldErrors.description}</p>
        )}
      </div>

      {/* Visibility */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.15em] text-[#555]">Visibility</span>
        <div className="flex items-center gap-6 py-1.5">
          {(["public", "private"] as const).map((v) => (
            <label
              key={v}
              className="flex cursor-pointer items-center gap-2 text-sm text-[#111]"
            >
              <input
                type="radio"
                name="type"
                value={v}
                checked={type === v}
                onChange={() => setType(v)}
                className="accent-[#111]"
              />
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </label>
          ))}
        </div>
        {fieldErrors.type && <p className="text-xs text-red-500">{fieldErrors.type}</p>}
      </div>

      <TagInput
        value={tags}
        onChange={setTags}
        suggestions={tagSuggestions}
        error={fieldErrors.tags}
      />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" variant="primary" loading={submitting} className="px-6 py-2.5">
          {isEditing ? "Save changes" : "Create event"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={submitting}
          className="px-4 py-2.5"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
