"use client";

import { useMemo, useState } from "react";
import { normalizeUsername } from "@stablecoin/domain";

export function UsernamePreview() {
  const [value, setValue] = useState("Merchant_01");
  const result = useMemo(() => {
    try {
      return { normalized: normalizeUsername(value), error: "" };
    } catch (error) {
      return { normalized: "", error: error instanceof Error ? error.message : "Invalid username" };
    }
  }, [value]);

  return (
    <div className="tool-card">
      <div className="tool-card__heading">
        <span className="tool-number">01</span>
        <div>
          <h3>Username normalization</h3>
          <p>One canonical form before database uniqueness checks.</p>
        </div>
      </div>
      <label htmlFor="username-preview">Preview a username</label>
      <input
        id="username-preview"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        aria-describedby="username-result"
      />
      <div id="username-result" className={result.error ? "tool-result tool-result--error" : "tool-result"} aria-live="polite">
        {result.error || (result.normalized ? `@${result.normalized}` : "Enter a username")}
      </div>
    </div>
  );
}
