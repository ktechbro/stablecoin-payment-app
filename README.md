# Stablecoin Payment App

A self-custodial USDC payment system being built for **Solana devnet**, with a focus on payment correctness, explicit state, idempotency, and verifiable accounting.

This repository contains **Project 1: the flagship payment application**. It is an early, working foundation—not a completed wallet or a production payment service.

## Current status

### Implemented

- TypeScript monorepo with Next.js, Fastify, PostgreSQL, and Solana packages
- Integer-based SPL token amount parsing and formatting without floating-point arithmetic
- Username normalization and payment-state transition rules
- SPL `transferChecked` transaction construction with:
  - Associated token accounts
  - Optional idempotent recipient ATA creation
  - Exact mint decimals and minor-unit amounts
  - Read-only Solana Pay-style payment references
- Initial PostgreSQL schema for users, wallets, usernames, payment requests, attempts, events, idempotency, ledger entries, and audit events
- Database enforcement for balanced journals and immutable ledger records
- Fastify health, database readiness, and public network-configuration endpoints
- Responsive web shell with live API/network status and username normalization preview
- Unit and API tests, TypeScript checks, and production builds

### Not implemented yet

- Privy authentication and embedded-wallet onboarding
- Authenticated username registration and persistence
- Persistent payment-intent creation and idempotent submission
- Real wallet signing and devnet transaction submission
- Helius webhook ingestion and confirmation monitoring
- Solana Pay QR payment screens, receipts, and history
- Ledger posting service and independent reconciliation
- Sponsored fees and signing policy

The UI deliberately describes these as upcoming work rather than presenting non-functional payment controls.

## Technology

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Web | Next.js, React |
| API | Fastify, Zod |
| Database | PostgreSQL, `pg` |
| Blockchain | Solana devnet, SPL Token, Solana web3.js |
| Package management | pnpm workspaces |
| Tests | Vitest |
| Local infrastructure | Docker Compose |

## Repository layout

```text
apps/
  api/                    # HTTP API and readiness checks
  web/                    # Initial product shell
packages/
  domain/                 # Amounts, usernames, and payment states
  solana/                 # Devnet configuration and SPL transfer construction
  db/                     # PostgreSQL client, migrations, and transaction helper
```

## Core design constraints

1. User private keys and seed phrases must never be stored by the backend.
2. Token amounts use integer minor units, never floating point.
3. Payment references and transaction signatures are unique.
4. Payment finality cannot regress to a lower commitment state.
5. Repeating an idempotent operation must not create another payment.
6. Journal entries must balance per asset and remain immutable.
7. Chain data, not a client callback, must eventually verify settlement.
8. The project remains on devnet throughout the portfolio implementation.

## Local development

### Prerequisites

- Node.js 22 or newer
- pnpm 11.9 or newer
- Docker with Docker Compose

The checked-in defaults are sufficient for local development. Deployment-specific settings are documented in `.env.example`; do not commit real credentials.

### Install and run

```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm dev
```

Open:

- Web: [http://localhost:3000](http://localhost:3000)
- API health: [http://localhost:3001/health](http://localhost:3001/health)
- API readiness: [http://localhost:3001/ready](http://localhost:3001/ready)
- Network configuration: [http://localhost:3001/v1/network](http://localhost:3001/v1/network)

### Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```

`pnpm test` and `pnpm typecheck` build the shared packages first so they also work from a clean checkout.

### Database commands

```bash
pnpm db:up          # Start PostgreSQL
pnpm db:migrate     # Apply pending migrations
pnpm db:down        # Stop local infrastructure
```

## API foundation

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Process liveness |
| `GET /ready` | PostgreSQL readiness |
| `GET /v1/network` | Public devnet, USDC mint, decimals, and commitment configuration |

## Network

- Solana cluster: **devnet**
- USDC mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- USDC decimals: `6`
- Default confirmation commitment: `confirmed`

Do not send mainnet assets to demo addresses.

## Implementation roadmap

1. Add Privy authentication and self-custodial embedded Solana wallets.
2. Persist users, wallets, and case-insensitively unique usernames.
3. Add authenticated, idempotent payment-intent and payment-request APIs.
4. Construct, sign, submit, and track real devnet USDC transfers.
5. Add Helius ingestion, RPC fallback, and confirmation/finality monitoring.
6. Add merchant Solana Pay QR payments, receipts, and paginated history.
7. Post immutable ledger entries and reconcile them against canonical chain data.
8. Add fee sponsorship with exact transaction validation before co-signing.

## Security and scope

This is a portfolio prototype under active development. It has not undergone a security audit and must not be used for real customer funds. Future webhook authentication, authorization, rate limiting, wallet-provider verification, and production key-management controls will be implemented with their corresponding features.
