import cors from "@fastify/cors";
import Fastify from "fastify";
import { DEVNET_USDC_DECIMALS } from "@stablecoin/solana";
import type { AppConfig } from "./config.js";

export interface ReadinessDatabase {
  query(text: string): Promise<unknown>;
}

export interface BuildAppOptions {
  config: AppConfig;
  database: ReadinessDatabase;
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions) {
  const app = Fastify({ logger: options.logger ?? false });

  app.register(cors, { origin: options.config.webOrigin });

  app.get("/health", async () => ({ status: "ok", service: "stablecoin-payment-api" }));

  app.get("/ready", async (_request, reply) => {
    try {
      await options.database.query("select 1");
      return { status: "ready" };
    } catch {
      return reply.code(503).send({ status: "unavailable" });
    }
  });

  app.get("/v1/network", async () => ({
    network: "devnet",
    commitment: options.config.commitment,
    usdcMint: options.config.usdcMint,
    usdcDecimals: DEVNET_USDC_DECIMALS,
  }));

  return app;
}
