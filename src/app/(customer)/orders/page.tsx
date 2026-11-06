import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCustomerContext } from "@/lib/page-auth";
import { OrderDeleteButton } from "@/components/order-delete-button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, PageHeader } from "@/components/ui";
import { formatDate, formatUsd } from "@/lib/utils";

export default async function OrdersPage() {
  const { customerId } = await getCustomerContext();
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-5">
      <PageHeader kicker="History" title="Orders" />
      {orders.length ? (
        <div className="card table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Order</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const label = order.items.map((item) => item.description).join(", ") || order.id;
                return (
                  <tr key={order.id}>
                    <td>
                      {order.items.map((item) => (
                        <div key={item.id} className="font-semibold">
                          {item.description}
                        </div>
                      ))}
                    </td>
                    <td>{formatUsd(order.totalCents)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <OrderDeleteButton orderId={order.id} label={label} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            body="Add a domain to your cart, then check out."
            action={
              <Link href="/search" className="btn btn-hot">
                <Search className="h-4 w-4" />
                Find a domain
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
