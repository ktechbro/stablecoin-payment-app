import { describe, expect, it } from "vitest";
import { formatTokenAmount, MAX_TOKEN_AMOUNT_MINOR, parseTokenAmount } from "./amount.js";

describe("parseTokenAmount", () => {
  it("parses USDC using integer minor units", () => {
    expect(parseTokenAmount("12.345678", 6)).toBe(12_345_678n);
    expect(parseTokenAmount("0.000001", 6)).toBe(1n);
    expect(parseTokenAmount("2", 6)).toBe(2_000_000n);
  });

  it("rejects excess precision, floats in scientific notation, and zero", () => {
    expect(() => parseTokenAmount("0.0000001", 6)).toThrow("at most 6");
    expect(() => parseTokenAmount("1e-6", 6)).toThrow("decimal number");
    expect(() => parseTokenAmount("0", 6)).toThrow("greater than zero");
  });

  it("rejects values above the SPL u64 limit", () => {
    expect(() => parseTokenAmount((MAX_TOKEN_AMOUNT_MINOR + 1n).toString(), 0)).toThrow("u64");
  });
});

describe("formatTokenAmount", () => {
  it("formats minor units without floating point arithmetic", () => {
    expect(formatTokenAmount(12_345_678n, 6)).toBe("12.345678");
    expect(formatTokenAmount(2_000_000n, 6)).toBe("2");
    expect(formatTokenAmount(1n, 6)).toBe("0.000001");
  });
});
