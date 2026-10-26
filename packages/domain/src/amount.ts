export const MAX_TOKEN_AMOUNT_MINOR = (1n << 64n) - 1n;

export function assertTokenAmountMinor(amount: bigint): void {
  if (amount <= 0n) {
    throw new Error("Amount must be greater than zero");
  }

  if (amount > MAX_TOKEN_AMOUNT_MINOR) {
    throw new Error("Amount exceeds the SPL token u64 limit");
  }
}

export function parseTokenAmount(input: string, decimals: number): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("Token decimals must be an integer between 0 and 18");
  }

  const match = /^(\d+)(?:\.(\d+))?$/.exec(input.trim());
  if (!match) {
    throw new Error("Amount must be a non-negative decimal number");
  }

  const whole = match[1]!;
  const fraction = match[2] ?? "";
  if (fraction.length > decimals) {
    throw new Error(`Amount supports at most ${decimals} decimal places`);
  }

  const scale = 10n ** BigInt(decimals);
  const wholeMinor = BigInt(whole) * scale;
  const fractionMinor = fraction.length === 0 ? 0n : BigInt(fraction.padEnd(decimals, "0"));
  const amount = wholeMinor + fractionMinor;

  assertTokenAmountMinor(amount);
  return amount;
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  if (amount < 0n) {
    throw new Error("Amount cannot be negative");
  }

  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("Token decimals must be an integer between 0 and 18");
  }

  if (decimals === 0) {
    return amount.toString();
  }

  const scale = 10n ** BigInt(decimals);
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction.length === 0 ? whole.toString() : `${whole}.${fraction}`;
}
