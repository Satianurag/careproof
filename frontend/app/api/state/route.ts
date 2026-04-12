import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

const LOCALNET_INDEXER = "http://127.0.0.1:8088/api/v3/graphql"

interface DeploymentConfig {
  contractAddress: string
  network: string
  networkName: string
  contractName: string
}

function loadDeploymentConfig(): DeploymentConfig | null {
  const deploymentPath = join(process.cwd(), "..", "contracts", "deployment.json")
  if (!existsSync(deploymentPath)) return null
  try {
    return JSON.parse(readFileSync(deploymentPath, "utf-8"))
  } catch {
    return null
  }
}

export async function GET() {
  const deployment = loadDeploymentConfig()
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || deployment?.contractAddress
  const network = deployment?.networkName || deployment?.network || "unknown"
  const indexerUrl = process.env.INDEXER_URL || LOCALNET_INDEXER

  if (!contractAddress) {
    return NextResponse.json(
      {
        connected: false,
        error: "Contract address not configured",
        total_credentials: 0,
        total_verifications: 0,
        active_count: 0,
        revoked_count: 0,
        consent_count: 0,
        verification_log_count: 0,
        paused: false,
      },
      { status: 200 },
    )
  }

  if (!indexerUrl) {
    return NextResponse.json(
      { connected: false, error: `Unknown network: ${network}`, network },
      { status: 400 },
    )
  }

  try {
    const query = `
      query ContractAction($address: HexEncoded!) {
        contractAction(address: $address) {
          state
        }
      }
    `

    const response = await fetch(indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { address: contractAddress },
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { connected: false, error: `Indexer returned ${response.status}`, network },
        { status: 502 },
      )
    }

    const json = await response.json()

    if (json.errors) {
      return NextResponse.json(
        { connected: false, error: json.errors[0]?.message || "GraphQL error", network },
        { status: 502 },
      )
    }

    const stateData = json.data?.contractAction?.state

    if (!stateData) {
      return NextResponse.json({
        connected: true,
        error: null,
        total_credentials: 0,
        total_verifications: 0,
        active_count: 0,
        revoked_count: 0,
        consent_count: 0,
        verification_log_count: 0,
        paused: false,
        network,
        contractAddress,
        raw: null,
      })
    }

    // Contract state is available — the indexer confirmed the contract exists
    // Ledger counters require the Compact contract module to decode from binary,
    // so we return connected=true with defaults and the raw state for reference
    return NextResponse.json({
      connected: true,
      error: null,
      raw: stateData,
      contractAddress,
      network,
      total_credentials: 0,
      total_verifications: 0,
      active_count: 0,
      revoked_count: 0,
      consent_count: 0,
      verification_log_count: 0,
      paused: false,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { connected: false, error: `Indexer unreachable: ${message}`, network },
      { status: 502 },
    )
  }
}
