type BadgeVariant = "public" | "private" | "default";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  public: "border-[#111] text-[#111]",
  private: "border-[#999] text-[#777]",
  default: "border-[#DCDCDC] text-[#555]",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
