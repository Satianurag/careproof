# CareProof

Privacy-preserving healthcare credential verification on the [Midnight Network](https://midnight.network). Built with zero-knowledge proofs — no plaintext medical data ever touches the blockchain.

CareProof targets a **local Midnight network** (`networkId: "undeployed"`) running in Docker. No external wallets or public testnets required.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 22 | Required by Midnight SDK |
| Docker | Latest | Runs node, indexer, proof server |
| Compact compiler | >= 0.30.0 | `compact compile` — install from [Midnight docs](https://docs.midnight.network) |
| npm | >= 10 | Contracts package manager |
| pnpm | Latest | Frontend package manager |

## Project Structure

```
careproof/
├── contracts/                  # Midnight smart contract + CLI tooling
│   ├── contracts/
│   │   ├── careproof.compact   # Compact smart contract source
│   │   └── compact-contracts/  # Vendored OpenZeppelin Compact libraries
│   ├── src/
│   │   ├── utils/environment.ts      # Localnet network config
│   │   ├── providers/midnight-providers.ts
│   │   ├── midnight-wallet.ts        # Wallet SDK integration
│   │   ├── deploy.ts                 # Contract deployment
│   │   ├── cli.ts                    # Admin CLI (interactive)
│   │   ├── fund-local.ts             # Fund wallet from genesis
│   │   ├── bootstrap-local-wallet.ts # Generate mnemonic + .env
│   │   ├── check-balance.ts          # Wallet balance checker
│   │   ├── health-check.ts           # Environment health check
│   │   └── e2e-smoke.ts              # End-to-end smoke tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Next.js dashboard UI
│   ├── app/
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   ├── dashboard/      # Overview stats + charts
│   │   │   ├── roles/          # Role management
│   │   │   ├── credentials/    # Issue/revoke credentials
│   │   │   ├── verification/   # Verify credentials
│   │   │   └── settings/       # Network & contract config
│   │   └── api/state/          # Contract state API route
│   ├── components/             # shadcn/ui components
│   ├── lib/hooks/              # SWR data fetching
│   ├── package.json
│   └── .env.local.example
└── .gitignore
```

## Localnet Services

Start the local Midnight network using the included Docker Compose file:

```bash
cd contracts
npm run docker:up
```

Stop it with `npm run docker:down`. View logs with `npm run docker:logs`.

| Service | Endpoint | Port |
|---------|----------|------|
| Midnight Node | `http://127.0.0.1:9944` | 9944 |
| Indexer (GraphQL) | `http://127.0.0.1:8088/api/v3/graphql` | 8088 |
| Indexer (WebSocket) | `ws://127.0.0.1:8088/api/v3/graphql/ws` | 8088 |
| Proof Server | `http://127.0.0.1:6300` | 6300 |

---

## Contracts

### Setup

```bash
cd contracts
npm install
```

### Bootstrap a Local Wallet

Generate a new mnemonic, derive the wallet seed, and write `.env` + `accounts.json`:

```bash
npm run bootstrap-wallet
```

### Fund the Wallet

Transfer tNIGHT from the genesis master wallet to your wallet:

```bash
npm run fund-local
```

### Compile the Contract

```bash
npm run compile
```

### Build TypeScript

```bash
npm run build
```

### Deploy

Compiles TS if needed, builds the wallet, and deploys the contract:

```bash
npm run deploy
```

Outputs `deployment.json` with the contract address.

### Admin CLI

Interactive CLI for role management, credential lifecycle, and contract control:

```bash
npm run cli
```

### Other Scripts

| Script | Description |
|--------|-------------|
| `npm run check-balance` | Show wallet addresses and balances |
| `npm run health-check` | Verify environment, dependencies, and network connectivity |
| `npm run e2e` | Run end-to-end smoke tests against a deployed contract |
| `npm run setup` | Compile + build + deploy in one step |
| `npm run reset` | Clean managed artifacts and recompile |
| `npm run clean` | Remove all build artifacts |
| `npm run validate` | Type-check + compile without emitting |
| `npm run docker:up` | Start local Midnight Docker containers |
| `npm run docker:down` | Stop local Midnight Docker containers |
| `npm run docker:logs` | Tail Docker container logs |

### Environment Variables (`contracts/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_SEED` | Yes | 64-char hex wallet seed |
| `PRIVATE_STATE_PASSWORD` | Yes | >= 16 chars, encrypts local private state |
| `CONTRACT_NAME` | No | Default: `careproof` |
| `PROOF_SERVER_URL` | No | Override proof server URL |
| `INDEXER_URL` | No | Override indexer URL |
| `INDEXER_WS_URL` | No | Override indexer WebSocket URL |
| `NODE_URL` | No | Override node RPC URL |

---

## Frontend

### Setup

```bash
cd frontend
pnpm install
cp .env.local.example .env.local
```

Edit `.env.local` and set `NEXT_PUBLIC_CONTRACT_ADDRESS` to the address from `contracts/deployment.json`.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 3.4 + shadcn/ui
- **Data fetching**: SWR (polls `/api/state`)
- **Validation**: Zod (Bech32m addresses, hex hashes, dates)
- **Charts**: Recharts

### Environment Variables (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes | Deployed contract address |
| `INDEXER_URL` | No | Override indexer URL (default: `http://127.0.0.1:8088/api/v3/graphql`) |

---

## Smart Contract Architecture

The `careproof.compact` contract implements:

- **Role-Based Access Control** — OpenZeppelin `AccessControl` with `ADMIN`, `DOCTOR`, and `VERIFIER` roles
- **Pausable** — OpenZeppelin `Pausable` for emergency stops
- **Credential Registry** — Stores only commitment hashes (no plaintext PHI on-chain), with a `HistoricMerkleTree` for ZK membership proofs
- **Patient Consent** — On-chain consent registry; credentials cannot be issued without patient approval
- **Revocation** — Doctors can revoke credentials they issued; revoked credentials fail verification
- **Verification Audit Trail** — Append-only log with nonce-based unique keys; on-chain expiry enforcement via `blockTimeLt`
- **Utility Circuits** — Role queries, credential key computation

### Circuit Summary

| Circuit | Role Required | Description |
|---------|---------------|-------------|
| `add_doctor` / `remove_doctor` | Admin | Manage doctor roles |
| `add_verifier` / `remove_verifier` | Admin | Manage verifier roles |
| `transfer_admin` | Admin | Transfer admin to new key |
| `pause` / `unpause` | Admin | Emergency contract control |
| `grant_consent` / `revoke_consent` | Patient (caller) | Manage consent for credential issuance |
| `issue_credential` | Doctor | Issue credential with commitment hash |
| `revoke_credential` | Doctor (issuer) | Revoke a previously issued credential |
| `verify_credential` | Verifier | Verify credential validity + expiry |
| `is_paused` | Any | Query pause state |
| `has_doctor_role` / `has_verifier_role` / `has_admin_role` | Any | Query role membership |
| `compute_credential_key` | Any | Compute composite credential key |

---

## License

MIT
