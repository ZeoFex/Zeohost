"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function OrderDeleteButton({ orderId, label }: { orderId: string; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onConfirm() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not delete the order.");
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
        title="Delete this order?"
        detail={label}
        description="This removes the order from your account history. Linked domains and hosting stay as they are."
        confirmLabel="Delete order"
        cancelLabel="Keep order"
        busy={busy}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
        onConfirm={() => void onConfirm()}
      />
    </div>
  );
}
