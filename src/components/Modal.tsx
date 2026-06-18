import React, { useEffect, useRef } from "react";

export type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  labelledById?: string; // optional id to link title
  className?: string;
};

// Accessible responsive modal (mobile full-screen, desktop centered card)
export default function Modal({ open, title, onClose, children, labelledById, className = "" }: ModalProps): JSX.Element | null {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = (document.activeElement as HTMLElement) || null;
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus first focusable inside panel
    const t = setTimeout(() => {
      const el = panelRef.current;
      if (!el) return;
      const focusables = getFocusable(el);
      (focusables[0] as HTMLElement | undefined)?.focus?.();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // focus trap
        const el = panelRef.current;
        if (!el) return;
        const items = getFocusable(el);
        if (items.length === 0) return;
        const first = items[0] as HTMLElement;
        const last = items[items.length - 1] as HTMLElement;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (!active || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!active || active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      // restore focus to trigger
      lastActiveRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const titleId = labelledById || (title ? "modal-title" : undefined);

  return (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayClick}
      className="fixed inset-0 z-[60] bg-black/40 flex items-stretch md:items-center justify-center"
      aria-hidden={false}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "bg-white shadow-xl w-full h-full md:h-auto md:max-h-[85vh] md:rounded-xl",
          "md:w-[min(92vw,720px)] overflow-auto",
          className,
        ].join(" ")}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 px-4 py-2">
          {title ? (
            <h2 id={titleId} className="text-sm font-semibold text-[#2a6a66]">
              {title}
            </h2>
          ) : <span />}
          <button
            type="button"
            className="rounded p-1 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#a1d4ca]"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const sel = [
    'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
    'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(sel));
  // filter invisible
  return nodes.filter((el) => el.offsetParent !== null || el === document.activeElement);
}
