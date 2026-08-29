import { memo, useEffect, useRef, useState } from "react";
import type { Tag } from "@/api/tags";
import { fetchTags } from "@/api/tags";
import type { EventFiltersState } from "@/hooks/useEventFilters";

// ---------------------------------------------------------------------------
// Tag multi-select dropdown
// ---------------------------------------------------------------------------

type TagFilterDropdownProps = {
  selected: string[];
  available: Tag[];
  onChange: (tags: string[]) => void;
};

function TagFilterDropdown({ selected, available, onChange }: TagFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((t) => t !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  const label =
    selected.length === 0
      ? "All tags"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} tags`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 border-b py-1.5 text-sm transition-colors focus:outline-none ${
          open || selected.length > 0
            ? "border-[#111] text-[#111]"
            : "border-[#E0E0E0] text-[#111] hover:border-[#999]"
        }`}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center border border-[#111] font-mono text-[9px]">
            {selected.length}
          </span>
        )}
        <span className="text-[10px] text-[#999]">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] border border-[#DCDCDC] bg-white shadow-sm">
          {available.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-[#999]">No tags yet</p>
          ) : (
            <ul>
              {available.map((tag) => (
                <li key={tag.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[#F8F8F8]">
                    <input
                      type="checkbox"
                      checked={selected.includes(tag.name)}
                      onChange={() => toggle(tag.name)}
                      className="accent-[#111]"
                    />
                    {tag.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setOpen(false);
              }}
              className="w-full border-t border-[#F0F0F0] px-3 py-2 text-left text-xs text-[#777] hover:text-[#111]"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EventFilters
// ---------------------------------------------------------------------------

type EventFiltersProps = {
  filters: EventFiltersState;
  onFilter: (key: keyof EventFiltersState, value: string | number) => void;
};

const selectClass =
  "border-b border-[#E0E0E0] bg-transparent py-1.5 text-sm text-[#111] focus:border-[#111] focus:outline-none";

export const EventFilters = memo(function EventFilters({ filters, onFilter }: EventFiltersProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [searchValue, setSearchValue] = useState(filters.q);

  useEffect(() => {
    fetchTags().then(setAvailableTags).catch(() => {});
  }, []);

  // Sync local search state when the URL's q changes externally (back/forward nav)
  useEffect(() => {
    setSearchValue(filters.q);
  }, [filters.q]);

  // Debounce: write q to the URL 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter("q", searchValue);
    }, 300);
    return () => clearTimeout(timer);
  // onFilter is a stable useCallback — intentionally omitted to avoid
  // resetting the 300ms timer on every filter change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Parse comma string → array for the dropdown; serialize array → comma string for the URL
  const selectedTags = filters.tags ? filters.tags.split(",").filter(Boolean) : [];

  function handleTagsChange(tags: string[]) {
    onFilter("tags", tags.join(","));
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Type filter */}
      <select
        value={filters.type}
        onChange={(e) => onFilter("type", e.target.value)}
        aria-label="Filter by type"
        className={selectClass}
      >
        <option value="">All types</option>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>

      {/* Tag multi-select */}
      <TagFilterDropdown
        selected={selectedTags}
        available={availableTags}
        onChange={handleTagsChange}
      />

      {/* Search */}
      <input
        type="search"
        placeholder="Search title or location…"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        aria-label="Search events"
        className="border-b border-[#E0E0E0] bg-transparent py-1.5 text-sm placeholder:text-[#999] focus:border-[#111] focus:outline-none"
      />
    </div>
  );
});
