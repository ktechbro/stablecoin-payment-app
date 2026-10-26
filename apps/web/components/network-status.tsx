"use client";

import { useEffect, useState } from "react";

type NetworkState =
  | { status: "loading" }
  | { status: "offline" }
  | { status: "online"; mint: string; commitment: string; decimals: number };

export function NetworkStatus() {
  const [state, setState] = useState<NetworkState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    async function loadNetwork() {
      try {
        const response = await fetch(`${apiUrl}/v1/network`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Network configuration unavailable");
        }

        const data = (await response.json()) as { usdcMint: string; commitment: string; usdcDecimals: number };
        setState({
          status: "online",
          mint: data.usdcMint,
          commitment: data.commitment,
          decimals: data.usdcDecimals,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({ status: "offline" });
        }
      }
    }

    void loadNetwork();
    return () => controller.abort();
  }, []);

  return (
    <aside className="network-card" aria-label="Network status">
      <div className="network-card__header">
        <span className={`status-dot status-dot--${state.status}`} />
        <span>{state.status === "online" ? "API connected" : state.status === "offline" ? "API offline" : "Checking API"}</span>
        <span className="network-label">Devnet</span>
      </div>
      {state.status === "online" ? (
        <dl className="network-details">
          <div>
            <dt>Asset</dt>
            <dd>USDC · {state.decimals} decimals</dd>
          </div>
          <div>
            <dt>Commitment</dt>
            <dd>{state.commitment}</dd>
          </div>
          <div>
            <dt>Mint</dt>
            <dd className="mint-value" title={state.mint}>{state.mint}</dd>
          </div>
        </dl>
      ) : (
        <p className="network-message">
          {state.status === "offline" ? "Start the API to load the canonical network configuration." : "Loading network configuration…"}
        </p>
      )}
    </aside>
  );
}
