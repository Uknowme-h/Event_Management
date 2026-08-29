type AlertProps = {
  message: string;
  className?: string;
};

export function Alert({ message, className = "" }: AlertProps) {
  return (
    <div
      role="alert"
      className={`border-l-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
    >
      {message}
    </div>
  );
}
