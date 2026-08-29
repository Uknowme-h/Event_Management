import { useRef, useState } from "react";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  error?: string;
};

export function TagInput({ value, onChange, suggestions = [], error }: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !value.includes(s) &&
      input.length > 0,
  );

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tag.length > 50) return;
    if (value.includes(tag)) return;
    if (value.length >= 10) return;
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-[0.15em] text-[#555]">Tags</label>

      <div
        className={`flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 border-b py-2 transition-colors ${
          error ? "border-red-400" : "border-[#E0E0E0] focus-within:border-[#111]"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 border border-[#DCDCDC] px-2 py-0.5 font-mono text-xs text-[#111]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="leading-none text-[#999] hover:text-[#111]"
            >
              ×
            </button>
          </span>
        ))}

        <div className="relative min-w-[100px] flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={value.length === 0 ? "Add a tag, press Enter" : ""}
            disabled={value.length >= 10}
            className="w-full bg-transparent text-sm placeholder:text-[#999] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />

          {showSuggestions && filtered.length > 0 && (
            <ul className="absolute left-0 top-full z-10 mt-1 w-48 border border-[#DCDCDC] bg-white">
              {filtered.slice(0, 6).map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={() => addTag(s)}
                    className="w-full px-3 py-2 text-left text-sm text-[#111] hover:bg-[#F8F8F8]"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-[#999]">{value.length}/10 · Enter or comma to add</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
