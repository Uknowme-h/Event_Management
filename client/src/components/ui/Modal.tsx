import { memo, useEffect } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "sm" (default) keeps the original 384px width; "lg" uses 560px for forms */
  size?: "sm" | "lg";
};

export const Modal = memo(function Modal({ open, onClose, title, children, size = "sm" }: ModalProps) {
  // Keyboard + body-scroll handling
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = size === "lg" ? "max-w-lg" : "max-w-sm";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`flex w-full ${widthClass} flex-col border border-[#DCDCDC] bg-white`}
        style={{ maxHeight: "min(90svh, 700px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#ECECEC] px-6 py-4">
          <h2 id="modal-title" className="font-mono text-sm font-medium tracking-tight text-[#111]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="font-mono text-lg leading-none text-[#999] hover:text-[#111]"
          >
            ×
          </button>
        </div>

        {/* Scrollable body — overflow only triggers on very small viewports */}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
});
