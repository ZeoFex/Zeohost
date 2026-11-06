"use client";

import { AlertTriangle, X } from "lucide-react";
import { BusyLabel } from "@/components/spinner";

export function ConfirmDialog({
  open,
  title,
  detail,
  description = "This removes it from your account history. This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Keep it",
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  detail?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,17,31,0.52)] px-4 py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 id="confirm-dialog-title" className="text-lg font-extrabold text-[var(--navy)]">
                {title}
              </h2>
              {detail ? <p className="mt-1 text-sm font-semibold text-[var(--navy)]">{detail}</p> : null}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost p-2"
            aria-label="Close"
            disabled={busy}
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p id="confirm-dialog-description" className="mt-5 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-hot" disabled={busy} onClick={onConfirm}>
            <BusyLabel busy={busy} busyText="Removing...">
              {confirmLabel}
            </BusyLabel>
          </button>
        </div>
      </section>
    </div>
  );
}
