export function paystackSecretKey() {
  return (
    process.env.PAYSTACK_SECRET_KEY?.trim() ||
    process.env.PAYMENT_PROVIDER_SECRET_KEY?.trim() ||
    ""
  );
}

export function paystackPublicKey() {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() || "";
}

export function paystackCurrency() {
  return (process.env.PAYSTACK_CURRENCY?.trim() || "USD").toUpperCase();
}

export function isPaystackConfigured() {
  return Boolean(paystackSecretKey());
}

/** Convert catalog USD cents into Paystack's smallest currency unit. */
export function usdCentsToPaystackAmount(usdCents: number) {
  const currency = paystackCurrency();
  if (currency === "USD") return Math.round(usdCents);
  if (currency === "GHS") {
    const rate = Number(process.env.PAYSTACK_GHS_PER_USD || "11.77");
    return Math.round((usdCents / 100) * rate * 100);
  }
  if (currency === "NGN") {
    const rate = Number(process.env.PAYSTACK_NGN_PER_USD || "1600");
    return Math.round((usdCents / 100) * rate * 100);
  }
  return Math.round(usdCents);
}
