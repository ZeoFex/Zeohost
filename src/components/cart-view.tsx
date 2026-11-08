"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Globe, Server, Trash2 } from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { CheckoutButton } from "@/components/checkout-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Spinner } from "@/components/spinner";

type Item = {
  id: string;
  type: string;
  description: string;
  amountCents: number;
};

export function CartView({ items, total }: { items: Item[]; total: number }) {
  const router = useRouter();
  const [pendingRemove, setPendingRemove] = useState<Item | null>(null);
  const [removing, setRemoving] = useState(false);

  async function confirmRemove() {
    if (!pendingRemove) return;
    setRemoving(true);
    try {
      await fetch(`/api/cart/${pendingRemove.id}`, { method: "DELETE" });
      setPendingRemove(null);
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="divide-y divide-[var(--line)]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="stat-icon">
                {item.type === "HOSTING" ? <Server className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              </span>
              <div>
                <p className="font-bold">{item.description}</p>
                <p className="text-sm text-[var(--muted)]">{item.type === "HOSTING" ? "Hosting plan" : "Domain · 1 year"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-extrabold">{formatUsd(item.amountCents)}</p>
              <button
                className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--danger)]"
                onClick={() => setPendingRemove(item)}
                disabled={removing}
                type="button"
                aria-label="Remove from cart"
              >
                {removing && pendingRemove?.id === item.id ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--line)] bg-[#f8fbff] px-5 py-5">
        <div className="flex items-center justify-between text-lg font-extrabold">
          <span>Total</span>
          <span>{formatUsd(total)}</span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">Secure checkout with Paystack.</p>
        <div className="mt-4">
          <CheckoutButton />
        </div>
      </div>
      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove this item from your cart?"
        detail={pendingRemove?.description}
        description="Are you sure you want to delete this item from your cart? You can add it again later if you change your mind."
        confirmLabel="Remove item"
        cancelLabel="Keep item"
        busy={removing}
        onCancel={() => {
          if (!removing) setPendingRemove(null);
        }}
        onConfirm={() => void confirmRemove()}
      />
    </div>
  );
}

export function CartIconLabel() {
  return (
    <span className="inline-flex items-center gap-2">
      <CreditCard className="h-4 w-4" />
      Pay now
    </span>
  );
}
