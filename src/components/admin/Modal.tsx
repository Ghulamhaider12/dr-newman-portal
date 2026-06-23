"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 py-10">
      <div
        className={`w-full ${maxWidth} rounded-card bg-white shadow-overlay`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-control text-ink-muted hover:bg-surface"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-overlay">
        <h3 className="font-serif text-xl font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-ink-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="inline-flex h-11 items-center rounded-control border border-border-strong px-5 text-base font-medium text-ink hover:bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-11 items-center rounded-control bg-[#B23B3B] px-5 text-base font-medium text-white hover:bg-[#9a3232]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
