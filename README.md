# CareProof

**Privacy-Preserving Healthcare Credentials on Midnight Network**

CareProof enables healthcare organizations to issue, manage, and verify medical credentials using zero-knowledge proofs on the [Midnight Network](https://midnight.network). Only commitment hashes are stored on-chain — no plaintext medical data ever touches the public ledger. Public testnet operations are supported on Preview and Preprod.

---

## Architecture

```
careproof/
├── contracts/        # Compact smart contract + deploy/CLI tooling
└── frontend/         # Next.js 16 web application (Lace wallet)
```

### Contract (`contracts/`)

Written in [Compact](https://docs.midnight.network) v0.30.0 with 16 compiled ZK circuits:

The OpenZeppelin Compact source library is wired into the root `contracts` package as a local dependency, so `cd contracts && npm install` is the only install step required for contract imports.

| Category | Circuits |
|----------|----------|
| **Role Management** | `add_doctor`, `remove_doctor`, `add_verifier`, `remove_verifier`, `transfer_admin` |
| **Access Control** | `has_doctor_role`, `has_verifier_role`, `has_admin_role` (OZ AccessControl) |
| **Contract Control** | `pause`, `unpause`, `is_paused` (OZ Pausable) |
| **Credentials** | `issue_credential`, `revoke_credential` |
| **Verification** | `verify_credential` |
| **Consent** | `grant_consent`, `revoke_consent` |
| **Utility** | `compute_credential_key` (pure) |

Key design:
- **Commitments only** — credential data is hashed off-chain; only `Bytes<32>` commitment hashes are stored on the ledger
- **OZ AccessControl + Pausable** — role-based access via OpenZeppelin Compact contracts
- **HistoricMerkleTree** — credential commitments stored in a Merkle tree for efficient ZK verification
- **Revocation registry** — revoked credentials tracked on-chain
- **Consent registry** — patients explicitly authorize doctors before credential issuance
- **Kernel time** — `blockTimeLt` used for credential expiry checks

### Frontend (`frontend/`)

Next.js 16 web app with Lace wallet integration via the Midnight DApp Connector API. The current supported public-testnet write path is the `contracts` CLI; the web app is kept honest by exposing wallet connection and ledger views while leaving contract mutations to the operator tooling.

| Role | Routes | Key Actions |
|------|--------|-------------|
| **Admin** | `/admin`, `/admin/roles`, `/admin/control` | Operational stats, environment diagnostics, wallet-aware dashboards |
| **Doctor** | `/doctor`, `/doctor/issue`, `/doctor/revoke` | Commitment preparation, credential views, active/revoked state inspection |
| **Patient** | `/patient`, `/patient/consent`, `/patient/credentials`, `/patient/credentials/[id]` | Consent views, credential vault, QR/download/copy presentation helpers |
| **Verifier** | `/verifier`, `/verifier/verify`, `/verifier/history` | Hash/file/paste verification views and on-chain audit history |

**Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Lucide icons, `@midnight-ntwrk/dapp-connector-api`.

---

## Getting Started

### Prerequisites

- **Node.js** >= 22
- **npm** >= 10
- [Compact compiler](https://docs.midnight.network) v0.30.0
- [Lace wallet](https://www.lace.io/) browser extension (for frontend interaction)

### 1. Configure Preview or Preprod

Create `contracts/.env` with your target public testnet and operator secrets:

```env
MIDNIGHT_NETWORK=preprod
WALLET_SEED=<64-char-hex-seed>
PRIVATE_STATE_PASSWORD=<at-least-16-characters>
```

Built-in defaults exist for both `preview` and `preprod`, and you can override the indexer/node/proof endpoints via env vars if needed.

### 2. Fund a Public Testnet Wallet

```bash
cd contracts
npm install
npm run check-balance
```

If the wallet has no balance, the scripts print your public-testnet funding instructions. Use the matching faucet for `preview` or `preprod`, wait for sync, and rerun the command.

### 3. Compile & Deploy

```bash
npm run compile    # Compact v0.30.0 → 16 circuits
npm run build      # TypeScript
npm run deploy     # Deploy to configured network
```

Outputs `deployment.json` with the contract address.

### 4. Health Check

```bash
npm run health-check
```

Validates: Node.js version, Compact compiler, `.env`, wallet seed, private state password, compiled contract, build output, indexer connectivity, and node RPC connectivity.

### 5. Run the Frontend

```bash
cd frontend
npm install
cp ../contracts/deployment.json .  # Or set env vars manually
```

Create `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<address-from-deployment.json>
NEXT_PUBLIC_NETWORK_NAME=Preprod
NEXT_PUBLIC_INDEXER_URL=https://indexer.preprod.midnight.network/api/v3/graphql
NEXT_PUBLIC_MIDNIGHT_NETWORK=preprod
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect your Lace wallet and explore the wallet-aware dashboards and ledger views.

---

## CLI

Interactive admin CLI for managing the deployed contract from the terminal:

```bash
cd contracts
npm run cli
```

18-option operator menu covering the supported public-testnet admin, issuance, verification, consent, role-query, and state-reading flows.

## Contracts Validation

```bash
cd contracts
npm run validate
```

Validates the TypeScript operator package and recompiles the Compact contract.

---

## How It Works

### Credential Lifecycle

```
Doctor                          Patient                         Verifier
  │                               │                               │
  │  1. grant_consent()           │                               │
  │<──────────────────────────────│                               │
  │  (patient authorizes doctor)  │                               │
  │                               │                               │
  │  2. issue_credential()        │                               │
  │  (commitment hash on-chain)   │                               │
  │──────────────────────────────>│                               │
  │                               │                               │
  │                               │  3. share commitment / VC     │
  │                               │  off-chain with verifier      │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │  4. verify_credential()       │
  │                               │<──────────────────────────────│
  │                               │  (result recorded on-chain)   │
```

### Privacy Model

- **Issuance**: Credential data is hashed off-chain. Only the `Bytes<32>` commitment is stored in a Merkle tree on-chain.
- **Presentation**: Patients share credential artifacts or commitment references off-chain; no plaintext medical data is published on-chain.
- **Verification**: Verifier confirms commitment exists on-chain, is active, and has not expired.
- **Consent**: Patients must explicitly grant consent before a doctor can issue credentials on their behalf.

---

## Multi-Network Support

Set `MIDNIGHT_NETWORK` in your `.env`:

| Value | Network | Description |
|-------|---------|-------------|
| `preview` | Preview Testnet | `indexer.preview.midnight.network` |
| `preprod` | Preprod | `indexer.preprod.midnight.network` |

All endpoints (indexer, node, proof server) have built-in defaults per network and can be overridden via env vars. See `.env.example` at the project root.

---

## W3C Verifiable Credentials

CareProof includes W3C VC-compatible envelope types in `frontend/lib/credentials/`:

- **`vc-types.ts`** — `CareProofVC`, `CareProofVP` types following the [W3C VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- **`vc-builder.ts`** — `buildVC()`, `buildVP()` factories wrapping on-chain commitments in W3C envelopes
- **`did.ts`** — `did:midnight:<network>:<key>` method helpers
- **`display.ts`** — Human-readable credential type labels, status styles, formatting utilities

---

## Testing

```bash
# Frontend unit tests (52 tests)
cd frontend && npx vitest run

# Frontend typecheck
cd frontend && npx tsc --noEmit

# Frontend lint
cd frontend && npx eslint app/ components/ contexts/ lib/ --quiet

# Frontend build
cd frontend && npx next build

# Contracts typecheck
cd contracts && npx tsc --noEmit

# Contracts validation
cd contracts && npm run validate
```

Test coverage:
- `lib/midnight/errors.ts` — Error hierarchy + `classifyError()` (21 tests)
- `lib/midnight/roles.ts` — Role resolution + routing (15 tests)
- `lib/credentials/commitment.ts` — SHA-256 hashing (6 tests)
- `lib/credentials/display.ts` — Display helpers + status resolution (10 tests)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Compact v0.30.0 (Midnight ZK language) |
| Contract Runtime | compact-runtime 0.15.0 |
| SDK | @midnight-ntwrk/midnight-js v4.0.4 |
| Wallet SDK | wallet-sdk-facade 3.0.0 |
| DApp Connector | @midnight-ntwrk/dapp-connector-api |
| Frontend | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui + Tailwind CSS v4 |
| Wallet | Lace (Midnight DApp Connector) |
| State Reading | GraphQL (Midnight indexer) |
| Testing | Vitest 4.1.3 |
| Client Storage | IndexedDB (browser) |
| QR Generation | qrcode.react |

---

## Operator Guide

### Initial Deployment

1. **Deploy the contract** — `cd contracts && npm run compile && npm run deploy`
2. **Note the contract address** from `deployment.json`
3. **Configure the frontend** — set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`
4. **Connect as admin** — the deploying wallet is the initial admin
5. **Grant roles** — use `/admin/roles` to add doctors and verifiers by their public keys

### Day-to-Day Operations

- **Monitor** — `/admin` dashboard shows credential counts, verification activity, and environment diagnostics
- **Emergency** — `/admin/control` to pause all contract operations
- **Role changes** — `/admin/roles` to add/remove doctors and verifiers

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "Wallet not detected" | Install Lace wallet extension with Midnight support |
| "Connection rejected" | Approve the connection request in your wallet popup |
| "Insufficient balance" | Request testnet DUST tokens from the faucet |
| "Patient consent required" | Patient must grant consent before doctor can issue |
| "Contract paused" | Admin must unpause from `/admin/control` |
| Wallet disconnect banner | Click "Reconnect" or refresh the page |

---

## User Guide

### For Patients

1. **Connect wallet** at `/login` — you'll be routed to the Patient dashboard
2. **Grant consent** at `/patient/consent` — enter the doctor's public key and credential ID
3. **View credentials** at `/patient/credentials` — see all issued credentials with on-chain status sync
4. **Share a credential** — click "View Details" on any credential to get QR code, download JSON, or copy to clipboard

### For Doctors

1. **Connect wallet** at `/login` — admin must have granted you DOCTOR_ROLE first
2. **Issue credential** at `/doctor/issue` — enter patient details, compute commitment hash, submit on-chain
3. **Revoke credential** at `/doctor/revoke` — by credential ID or from the active credentials list

### For Verifiers

1. **Connect wallet** at `/login` — admin must have granted you VERIFIER_ROLE first
2. **Verify** at `/verifier/verify` — by commitment hash, upload JSON file, or paste JSON
3. **Pre-check** (read-only, no audit log) or **Verify on-chain** (creates audit entry)
4. **History** at `/verifier/history` — view all past verification audit log entries

---

## License

MIT
