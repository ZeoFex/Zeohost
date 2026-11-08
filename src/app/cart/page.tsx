import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { CartView } from "@/components/cart-view";
import { CustomerShell } from "@/components/customer-shell";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { EmptyState, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getSession, SESSION_COOKIE } from "@/lib/session";

export default async function CartPage() {
  const session = await getSession(SESSION_COOKIE);
  const isCustomer = session?.role === "CUSTOMER" && Boolean(session.customerId);

  const items = isCustomer
    ? await prisma.cartItem.findMany({
        where: { customerId: session!.customerId! },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const total = items.reduce((sum, item) => sum + item.amountCents, 0);
  const cartCount = items.length;

  const body = (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        kicker="Checkout"
        title="Your cart"
        actions={
          <Link href="/search" className="btn btn-ghost">
            <Search className="h-4 w-4" />
            Keep shopping
          </Link>
        }
      />
      {items.length ? (
        <CartView
          items={items.map((item) => ({
            id: item.id,
            type: item.type,
            description: item.description,
            amountCents: item.amountCents,
          }))}
          total={total}
        />
      ) : (
        <div className="card">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            body={
              isCustomer
                ? "Search for a domain, then add it here."
                : "Sign in to see items you’ve added, or find a domain to get started."
            }
            action={
              isCustomer ? (
                <Link href="/search" className="btn btn-hot">
                  <Search className="h-4 w-4" />
                  Find a domain
                </Link>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/login?next=/cart" className="btn btn-hot">
                    Sign in
                  </Link>
                  <Link href="/search" className="btn btn-ghost">
                    <Search className="h-4 w-4" />
                    Find a domain
                  </Link>
                </div>
              )
            }
          />
        </div>
      )}
    </div>
  );

  if (isCustomer) {
    return (
      <CustomerShell name={session!.name} email={session!.email} cartCount={cartCount}>
        {body}
      </CustomerShell>
    );
  }

  return (
    <div className="nm-site min-h-screen">
      <MarketingHeader cartCount={0} />
      <main className="px-5 py-8 md:py-10">{body}</main>
      <MarketingFooter />
    </div>
  );
}
