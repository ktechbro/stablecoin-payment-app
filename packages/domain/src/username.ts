const USERNAME_PATTERN = /^(?=.{3,32}$)[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$/;

export function normalizeUsername(input: string): string {
  const normalized = input.trim().normalize("NFKC").toLowerCase();

  if (!USERNAME_PATTERN.test(normalized)) {
    throw new Error(
      "Username must be 3-32 characters, use lowercase letters, numbers, or underscores, and start and end with a letter or number",
    );
  }

  return normalized;
}
