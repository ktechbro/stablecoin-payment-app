import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

function createApp(database = { query: async () => ({ rows: [] }) }) {
  app = buildApp({ config: loadConfig({}), database });
  return app;
}

describe("API foundation", () => {
  it("reports service health", async () => {
    const response = await createApp().inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "stablecoin-payment-api" });
  });

  it("checks database readiness", async () => {
    const response = await createApp().inject({ method: "GET", url: "/ready" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ready" });
  });

  it("returns unavailable when the database check fails", async () => {
    const response = await createApp({
      query: async () => {
        throw new Error("database unavailable");
      },
    }).inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: "unavailable" });
  });

  it("publishes only public devnet network configuration", async () => {
    const response = await createApp().inject({ method: "GET", url: "/v1/network" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ network: "devnet", usdcDecimals: 6, commitment: "confirmed" });
  });
});
