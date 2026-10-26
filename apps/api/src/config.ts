import { z } from "zod";

const environmentSchema = z.object({
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/stablecoin_payments"),
  SOLANA_RPC_URL: z.string().url().default("https://api.devnet.solana.com"),
  SOLANA_USDC_MINT: z.string().min(32).default("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
  SOLANA_COMMITMENT: z.enum(["processed", "confirmed", "finalized"]).default("confirmed"),
});

export type AppConfig = {
  port: number;
  webOrigin: string;
  databaseUrl: string;
  solanaRpcUrl: string;
  usdcMint: string;
  commitment: "processed" | "confirmed" | "finalized";
};

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = environmentSchema.parse(environment);
  return {
    port: parsed.API_PORT,
    webOrigin: parsed.WEB_ORIGIN,
    databaseUrl: parsed.DATABASE_URL,
    solanaRpcUrl: parsed.SOLANA_RPC_URL,
    usdcMint: parsed.SOLANA_USDC_MINT,
    commitment: parsed.SOLANA_COMMITMENT,
  };
}
