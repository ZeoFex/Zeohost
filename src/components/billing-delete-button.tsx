"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function BillingDeleteButton({
  kind,
  id,
  label,
}: {
  kind: "invoice" | "payment";
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const noun = kind === "invoice" ? "invoice" : "payment";

  async function onConfirm() {
    setBusy(true);
    setError("");
    try {
      const path = kind === "invoice" ? `/api/invoices/${id}` : `/api/payments/${id}`;
      const response = await fetch(path, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? `Could not delete the ${noun}.`);
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
      {error ? <p className="text-xs font-semibold text-[var(--danger)]">{error}</p> : null}
      <ConfirmDialog
        open={open}
        title={`Delete this ${noun}?`}
        detail={label}
        description={`This removes the ${noun} from your billing history. It cannot be undone.`}
        confirmLabel={`Delete ${noun}`}
        cancelLabel={`Keep ${noun}`}
        busy={busy}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
        onConfirm={() => void onConfirm()}
      />
    </div>
  );
}
