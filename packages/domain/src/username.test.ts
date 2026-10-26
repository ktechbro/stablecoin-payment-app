import { describe, expect, it } from "vitest";
import { normalizeUsername } from "./username.js";

describe("normalizeUsername", () => {
  it("normalizes case, surrounding whitespace, and compatibility characters", () => {
    expect(normalizeUsername("  Alice_Pay  ")).toBe("alice_pay");
    expect(normalizeUsername("Ａｌｉｃｅ123")).toBe("alice123");
  });

  it("accepts letters, numbers, and interior underscores", () => {
    expect(normalizeUsername("merchant_01")).toBe("merchant_01");
  });

  it.each(["ab", "_alice", "alice_", "alice-pay", "alice pay", "a".repeat(33)])(
    "rejects invalid username %s",
    (value) => {
      expect(() => normalizeUsername(value)).toThrow("Username must");
    },
  );
});
