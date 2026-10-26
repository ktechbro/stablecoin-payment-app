import { createPool } from "@stablecoin/db";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const pool = createPool({ connectionString: config.databaseUrl });
const app = buildApp({ config, database: pool, logger: true });

async function shutdown() {
  await app.close();
  await pool.end();
}

process.on("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.on("SIGTERM", () => void shutdown().then(() => process.exit(0)));

try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  await pool.end();
  process.exit(1);
}
