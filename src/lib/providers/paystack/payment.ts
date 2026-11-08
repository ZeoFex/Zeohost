import { randomUUID } from "crypto";
import { getAppUrl } from "@/lib/env";
import {
  isPaystackConfigured,
  paystackCurrency,
  paystackSecretKey,
  usdCentsToPaystackAmount,
} from "@/lib/providers/paystack/config";
import type { PaymentProvider, PaymentRequest, PaymentResult } from "@/lib/providers/types";

type PaystackInitResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    id: number;
    metadata?: Record<string, unknown>;
  };
};

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const secret = paystackSecretKey();
  if (!secret) throw new Error("Paystack is not configured.");
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as T & { message?: string; status?: boolean };
  if (!response.ok || (body as { status?: boolean }).status === false) {
    throw new Error((body as { message?: string }).message || "Paystack request failed.");
  }
  return body;
}

export class PaystackPaymentProvider implements PaymentProvider {
  async createPayment(input: PaymentRequest): Promise<PaymentResult> {
    if (!isPaystackConfigured()) throw new Error("Paystack is not configured.");

    const email = String(input.metadata?.email ?? "").trim();
    if (!email) throw new Error("A customer email is required for Paystack checkout.");

    const orderId = String(input.metadata?.orderId ?? "");
    const reference = `zh_${orderId || randomUUID()}`.replace(/[^a-zA-Z0-9_.=-]/g, "").slice(0, 100);
    const amount = usdCentsToPaystackAmount(input.amountCents);
    const currency = paystackCurrency();
    const callbackUrl = `${getAppUrl()}/api/checkout/paystack/callback`;

    const initialized = await paystackFetch<PaystackInitResponse>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email,
        amount,
        currency,
        reference,
        callback_url: callbackUrl,
        metadata: {
          orderId,
          amountCents: input.amountCents,
          ...(input.metadata ?? {}),
        },
      }),
    });

    if (!initialized.data?.authorization_url || !initialized.data.reference) {
      throw new Error(initialized.message || "Paystack did not return a checkout URL.");
    }

    return {
      id: initialized.data.reference,
      status: "PENDING",
      amountCents: input.amountCents,
      providerRef: initialized.data.reference,
      authorizationUrl: initialized.data.authorization_url,
      accessCode: initialized.data.access_code,
    };
  }

  async verifyPayment(providerRef: string): Promise<PaymentResult> {
    const verified = await paystackFetch<PaystackVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(providerRef)}`,
    );
    const data = verified.data;
    if (!data) throw new Error("PAYMENT_NOT_FOUND");

    const status =
      data.status === "success"
        ? ("SUCCESS" as const)
        : data.status === "failed" || data.status === "abandoned"
          ? ("FAILED" as const)
          : ("PENDING" as const);

    const metaAmount = Number(data.metadata?.amountCents);
    return {
      id: String(data.id),
      status,
      // Prefer the USD catalog amount we stored in metadata; Paystack `amount` is gateway subunits.
      amountCents: Number.isFinite(metaAmount) ? metaAmount : 0,
      providerRef: data.reference,
    };
  }

  async getPayment(providerRef: string) {
    try {
      return await this.verifyPayment(providerRef);
    } catch {
      return null;
    }
  }

  async refundPayment(providerRef: string): Promise<PaymentResult> {
    const current = await this.verifyPayment(providerRef);
    await paystackFetch("/refund", {
      method: "POST",
      body: JSON.stringify({ transaction: providerRef }),
    });
    return { ...current, status: "REFUNDED" };
  }
}

export const paystackPaymentProvider = new PaystackPaymentProvider();
