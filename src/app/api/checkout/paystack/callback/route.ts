import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";
import { completePaystackCheckout } from "@/lib/services/billing.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref") || "";
  const app = getAppUrl();

  if (!reference) {
    return NextResponse.redirect(new URL("/cart?error=missing_payment_reference", app));
  }

  try {
    const result = await completePaystackCheckout({ reference });
    const domain = result.registeredDomains[0];
    const success = domain
      ? `/checkout/success?domain=${encodeURIComponent(domain.name)}&id=${encodeURIComponent(domain.id)}`
      : "/orders";
    return NextResponse.redirect(new URL(success, app));
  } catch (error) {
    console.error("Paystack callback failed", error);
    return NextResponse.redirect(new URL("/cart?error=payment_failed", app));
  }
}
