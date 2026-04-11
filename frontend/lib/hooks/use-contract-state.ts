import useSWR from "swr"

export interface ContractState {
  connected: boolean
  error: string | null
  total_credentials: number
  total_verifications: number
  active_count: number
  revoked_count: number
  consent_count: number
  verification_log_count: number
  paused: boolean
  contractAddress?: string
  network?: string
  raw?: unknown
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useContractState() {
  const { data, error, isLoading, mutate } = useSWR<ContractState>(
    "/api/state",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    },
  )

  return {
    state: data ?? null,
    isLoading,
    isError: !!error,
    error: error?.message ?? data?.error ?? null,
    refresh: mutate,
  }
}
