import type { CreatePaymentInput } from "@/lib/api/types";

const keys = new Map<string, string>();

function fingerprint(invoiceId: string, input: CreatePaymentInput): string {
  return JSON.stringify({
    invoiceId,
    amount: input.amount,
    method: input.method,
    reference: input.reference ?? "",
    currency: input.currency ?? "",
  });
}

/** Same invoice + payload reuses one key so a retry does not create a second payment. */
export function paymentIdempotencyKey(
  invoiceId: string,
  input: CreatePaymentInput,
): string {
  const id = fingerprint(invoiceId, input);
  const existing = keys.get(id);
  if (existing) return existing;
  const key = crypto.randomUUID();
  keys.set(id, key);
  return key;
}

export function clearPaymentIdempotencyKey(
  invoiceId: string,
  input: CreatePaymentInput,
): void {
  keys.delete(fingerprint(invoiceId, input));
}
