import { jsonError, jsonOk } from "@/lib/api";
import { handleRouteError } from "@/lib/route";
import { requireCustomer } from "@/lib/guard";
import { deleteCustomerOrder } from "@/lib/services/billing.service";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireCustomer();
    if (!rateLimit(`order-delete:${session.customerId}:${clientIp(request)}`, 20, 60_000).ok) {
      return jsonError("Too many attempts. Please wait a moment.", 429);
    }
    const { id } = await context.params;
    const result = await deleteCustomerOrder(session.customerId, id, session.sub);
    if (!result) return jsonError("We couldn't find that order.", 404);
    return jsonOk({
      ...result,
      message: "Order removed from your account.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
