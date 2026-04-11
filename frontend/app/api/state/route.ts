import { NextResponse } from "next/server"

const LOCALNET_INDEXER = "http://127.0.0.1:8088/api/v3/graphql"

export async function GET() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const network = "undeployed"
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
      { connected: false, error: `Unknown network: ${network}` },
      { status: 400 },
    )
  }

  try {
    const query = `
      query ContractState($address: HexEncodedBytes!) {
        contractState(contractAddress: $address) {
          data
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
        { connected: false, error: `Indexer returned ${response.status}` },
        { status: 502 },
      )
    }

    const json = await response.json()

    if (json.errors) {
      return NextResponse.json(
        { connected: false, error: json.errors[0]?.message || "GraphQL error" },
        { status: 502 },
      )
    }

    const stateData = json.data?.contractState?.data

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
        raw: null,
      })
    }

    return NextResponse.json({
      connected: true,
      error: null,
      raw: stateData,
      contractAddress,
      network,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { connected: false, error: `Indexer unreachable: ${message}` },
      { status: 502 },
    )
  }
}
