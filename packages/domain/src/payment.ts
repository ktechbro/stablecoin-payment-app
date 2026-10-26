export const PAYMENT_STATES = [
  "created",
  "awaiting_signature",
  "submitted",
  "confirmed",
  "finalized",
  "failed",
  "expired",
  "requires_review",
] as const;

export type PaymentState = (typeof PAYMENT_STATES)[number];

const TRANSITIONS: Record<PaymentState, readonly PaymentState[]> = {
  created: ["awaiting_signature", "expired", "failed"],
  awaiting_signature: ["submitted", "expired", "failed", "requires_review"],
  submitted: ["confirmed", "expired", "failed", "requires_review"],
  confirmed: ["finalized", "requires_review"],
  finalized: ["requires_review"],
  failed: ["requires_review"],
  expired: ["requires_review"],
  requires_review: ["confirmed", "finalized", "failed", "expired"],
};

export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

export function assertPaymentTransition(from: PaymentState, to: PaymentState): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Invalid payment transition: ${from} -> ${to}`);
  }
}
