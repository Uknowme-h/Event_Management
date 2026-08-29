type InputProps = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs uppercase tracking-[0.15em] text-[#555]">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full border-b bg-transparent py-2 text-sm placeholder:text-[#999] focus:outline-none transition-colors ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-[#E0E0E0] focus:border-[#111]"
        }`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
