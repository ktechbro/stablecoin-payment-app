import { describe, expect, it } from "vitest";
import { assertPaymentTransition, canTransitionPayment } from "./payment.js";

describe("payment transitions", () => {
  it("follows the normal settlement path", () => {
    expect(canTransitionPayment("created", "awaiting_signature")).toBe(true);
    expect(canTransitionPayment("awaiting_signature", "submitted")).toBe(true);
    expect(canTransitionPayment("submitted", "confirmed")).toBe(true);
    expect(canTransitionPayment("confirmed", "finalized")).toBe(true);
  });

  it("allows idempotent observations but rejects finality regression", () => {
    expect(canTransitionPayment("finalized", "finalized")).toBe(true);
    expect(canTransitionPayment("finalized", "confirmed")).toBe(false);
    expect(() => assertPaymentTransition("finalized", "submitted")).toThrow("Invalid payment transition");
  });

  it("routes late or unusual activity through review", () => {
    expect(canTransitionPayment("expired", "requires_review")).toBe(true);
    expect(canTransitionPayment("requires_review", "finalized")).toBe(true);
  });
});
