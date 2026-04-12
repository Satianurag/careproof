"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheck, ShieldCheck, UserCog, XCircle, Info } from "lucide-react"
import { useContractState } from "@/lib/hooks/use-contract-state"
import { SkeletonCard } from "@/components/skeleton-card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3 h-3 text-neutral-500 inline-block ml-1 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="bg-neutral-800 border-neutral-700 text-white max-w-xs text-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-white",
  valueColor = "text-white",
  tooltip,
  isLoading,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  iconColor?: string
  valueColor?: string
  tooltip?: string
  isLoading?: boolean
}) {
  if (isLoading) return <SkeletonCard />

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 tracking-wider">
              {label}
              {tooltip && <InfoTip text={tooltip} />}
            </p>
            <p className={`text-2xl font-bold ${valueColor} font-mono`}>{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  )
}

const PLACEHOLDER_CHART_DATA = [
  { name: "Mon", issued: 0, verified: 0 },
  { name: "Tue", issued: 0, verified: 0 },
  { name: "Wed", issued: 0, verified: 0 },
  { name: "Thu", issued: 0, verified: 0 },
  { name: "Fri", issued: 0, verified: 0 },
  { name: "Sat", issued: 0, verified: 0 },
  { name: "Sun", issued: 0, verified: 0 },
]

export default function DashboardOverviewPage() {
  const { state, isLoading } = useContractState()

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Credentials"
          value={state?.total_credentials ?? "—"}
          icon={FileCheck}
          iconColor="text-orange-500"
          tooltip="Total number of credentials issued on-chain via the CareProof contract"
          isLoading={isLoading}
        />
        <StatCard
          label="Active Credentials"
          value={state?.active_count ?? "—"}
          icon={ShieldCheck}
          tooltip="Credentials currently in the Merkle tree that have not been revoked or expired"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Verifications"
          value={state?.total_verifications ?? "—"}
          icon={UserCog}
          tooltip="Number of ZK proof verifications performed by authorized verifiers"
          isLoading={isLoading}
        />
        <StatCard
          label="Revoked Credentials"
          value={state?.revoked_count ?? "—"}
          icon={XCircle}
          iconColor="text-red-500"
          valueColor="text-red-500"
          tooltip="Credentials that have been revoked by the issuing doctor"
          isLoading={isLoading}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Summary */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              Role Allocation
              <InfoTip text="Role-based access control powered by OpenZeppelin. Doctors can issue credentials, Verifiers can verify them, Admins manage roles." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">&mdash;</div>
                <div className="text-xs text-neutral-500">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">&mdash;</div>
                <div className="text-xs text-neutral-500">Verifiers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">&mdash;</div>
                <div className="text-xs text-neutral-500">Admins</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { id: "ADMIN", name: "Contract Administrator", status: "active" },
                { id: "DOCTOR", name: "Healthcare Provider", status: "active" },
                { id: "VERIFIER", name: "Credential Verifier", status: "active" },
              ].map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <div>
                      <div className="text-xs text-white font-mono">{role.id}</div>
                      <div className="text-xs text-neutral-500">{role.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[
                {
                  time: "Pending...",
                  actor: "System",
                  action: "Contract deployed on",
                  detail: "Localnet",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="text-xs border-l-2 border-orange-500 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors"
                >
                  <div className="text-neutral-500 font-mono">{log.time}</div>
                  <div className="text-white">
                    <span className="text-orange-500 font-mono">{log.actor}</span> {log.action}{" "}
                    <span className="text-white font-mono">{log.detail}</span>
                  </div>
                </div>
              ))}
              <div className="text-xs text-neutral-500 text-center py-4">
                Activity will appear here once connected to the contract
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ZK Proof Engine Status */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              ZK Proof Engine
              <InfoTip text="Zero-knowledge proofs enable credential verification without revealing the underlying data. Powered by Midnight's Compact language." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="text-xs text-neutral-400">Status</span>
                <span className="text-xs text-green-400 font-mono">READY</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="text-xs text-neutral-400">Compact Version</span>
                <span className="text-xs text-orange-500 font-mono">v0.30.0</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="text-xs text-neutral-400">Merkle Tree Depth</span>
                <span className="text-xs text-white font-mono">16</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="text-xs text-neutral-400">Commitment Scheme</span>
                <span className="text-xs text-white font-mono text-right">
                  {"persistentHash<Bytes<32>>"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credential Activity Chart */}
        <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              Credential Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {state?.connected ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PLACEHOLDER_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="name" stroke="#737373" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#737373" tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040", borderRadius: 6 }}
                      labelStyle={{ color: "#a3a3a3" }}
                    />
                    <Area type="monotone" dataKey="issued" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="verified" stroke="#ffffff" fill="#ffffff" fillOpacity={0.05} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-neutral-500 text-sm">Connect to contract to view live data</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credential Breakdown */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">Credential Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-xs text-white font-medium">Active Credentials</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">In Merkle Tree</span>
                    <span className="text-white font-bold font-mono">&mdash;</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">With Active Consent</span>
                    <span className="text-white font-bold font-mono">&mdash;</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Expiring Soon</span>
                    <span className="text-white font-bold font-mono">&mdash;</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-xs text-red-500 font-medium">Revoked Credentials</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Total Revoked</span>
                    <span className="text-white font-bold font-mono">&mdash;</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Revoked This Month</span>
                    <span className="text-white font-bold font-mono">&mdash;</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Expired</span>
                    <span className="text-white font-bold font-mono">&mdash;</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
