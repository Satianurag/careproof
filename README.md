# CareProof

**Privacy-Preserving Healthcare Credentials on Midnight Network**

CareProof enables healthcare organizations to issue, manage, and verify medical credentials using zero-knowledge proofs on the [Midnight Network](https://midnight.network). Only commitment hashes are stored on-chain — no plaintext medical data ever touches the public ledger. Patients prove credential ownership without revealing any personal information.

---

## Architecture

```
careproof/
├── contracts/        # Compact smart contract + deploy/CLI tooling
└── frontend/         # Next.js 16 web application (Lace wallet)
```

### Contract (`contracts/`)

Written in [Compact](https://docs.midnight.network/develop/tutorial/building/compact) v0.30.0 with 17 compiled ZK circuits:

| Category | Circuits |
|----------|----------|
| **Role Management** | `add_doctor`, `remove_doctor`, `add_verifier`, `remove_verifier`, `transfer_admin` |
| **Access Control** | `has_doctor_role`, `has_verifier_role`, `has_admin_role` (OZ AccessControl) |
| **Contract Control** | `pause`, `unpause`, `is_paused` (OZ Pausable) |
| **Credentials** | `issue_credential`, `revoke_credential`, `prove_credential_ownership` |
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

Next.js 16 web app with Lace wallet integration via the Midnight DApp Connector API.

| Role | Routes | Key Actions |
|------|--------|-------------|
| **Admin** | `/admin`, `/admin/roles`, `/admin/control` | Operational stats, environment diagnostics, grant/revoke doctor & verifier roles, pause/unpause, transfer admin |
| **Doctor** | `/doctor`, `/doctor/issue`, `/doctor/revoke` | Issue credential commitments, revoke credentials, view active/revoked |
| **Patient** | `/patient`, `/patient/consent`, `/patient/credentials`, `/patient/credentials/[id]` | Manage consent, view credential vault, share via QR/download/copy, prove ownership |
| **Verifier** | `/verifier`, `/verifier/verify`, `/verifier/history` | Verify by hash/file/paste, on-chain audit log, verification history |

**Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Lucide icons, `@midnight-ntwrk/dapp-connector-api`.

---

## Getting Started

### Prerequisites

- **Node.js** >= 22
- **npm** >= 10
- [Compact compiler](https://docs.midnight.network) v0.30.0
- [Docker](https://docs.docker.com/get-docker/) (for localnet and proof server)
- [Lace wallet](https://www.lace.io/) browser extension (for frontend interaction)

### 1. Start the Local Midnight Network

```bash
cd contracts
cp standalone.env.example .env
docker compose -f standalone.yml up -d
```

Local stack:
- `http://127.0.0.1:9944` — Midnight node
- `http://127.0.0.1:8088/api/v3/graphql` — Indexer
- `ws://127.0.0.1:8088/api/v3/graphql/ws` — Indexer WebSocket
- `http://127.0.0.1:6300` — Proof server

### 2. Bootstrap & Fund a Wallet

```bash
cd contracts
npm install
npm run wallet:bootstrap   # Generates .env + accounts.json
```

Then fund using [midnight-local-dev](https://github.com/midnightntwrk/midnight-local-dev):

```bash
git clone https://github.com/midnightntwrk/midnight-local-dev.git /tmp/midnight-local-dev
cd /tmp/midnight-local-dev && npm install && npm start
# Choose option [1], provide your accounts.json path
```

Verify funding:

```bash
npm run check-balance
```

### 3. Compile & Deploy

```bash
npm run compile    # Compact v0.30.0 → 17 circuits
npm run build      # TypeScript
npm run deploy     # Deploy to configured network
```

Outputs `deployment.json` with the contract address.

### 4. Health Check

```bash
npm run health-check
```

Validates: Node.js version, Compact compiler, Docker, `.env`, wallet seed, compiled contract, deployment, indexer connectivity, node RPC connectivity.

### 5. Run the Frontend

```bash
cd frontend
npm install
cp ../contracts/deployment.json .  # Or set env vars manually
```

Create `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<address-from-deployment.json>
NEXT_PUBLIC_NETWORK_NAME=Localnet
NEXT_PUBLIC_INDEXER_URL=http://127.0.0.1:8088/api/v3/graphql
NEXT_PUBLIC_MIDNIGHT_NETWORK=undeployed
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect your Lace wallet and select a role.

---

## CLI

Interactive admin CLI for managing the deployed contract from the terminal:

```bash
cd contracts
npm run cli
```

18-option menu covering all 17 circuits: role management, pause/unpause, issue/revoke credentials, verify, consent, role queries, and full ledger state reading.

## E2E Smoke Test

```bash
cd contracts
npm run e2e
```

Deploys a test run against the deployed contract: reads state, checks paused status, grants/revokes roles, pauses/unpauses, and verifies final ledger state.

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
  │                               │  3. prove_credential_ownership()
  │                               │  (ZK proof, no data revealed) │
  │                               │──────────────────────────────>│
  │                               │                               │
  │                               │  4. verify_credential()       │
  │                               │<──────────────────────────────│
  │                               │  (result recorded on-chain)   │
```

### Privacy Model

- **Issuance**: Credential data is hashed off-chain. Only the `Bytes<32>` commitment is stored in a Merkle tree on-chain.
- **Ownership proof**: Patient proves they hold a valid, non-revoked, non-expired credential via ZK proof — zero medical data is revealed.
- **Verification**: Verifier confirms commitment exists in the Merkle tree, is active, and has not expired.
- **Consent**: Patients must explicitly grant consent before a doctor can issue credentials on their behalf.

---

## Multi-Network Support

Set `MIDNIGHT_NETWORK` in your `.env`:

| Value | Network | Description |
|-------|---------|-------------|
| `undeployed` | Localnet | Local Docker stack (default) |
| `preview` | Preview Testnet | `indexer.preview.midnight.network` |
| `preprod` | Preprod | `indexer.preprod.midnight.network` |
| `mainnet` | Mainnet | `indexer.midnight.network` |

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

# Contract E2E smoke tests (22 tests)
cd contracts && npm run e2e
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
