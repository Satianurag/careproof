"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// ─── Types ─────────────────────────────────────────────────────────────

export interface SimRole {
  address: string
  role: "doctor" | "verifier"
  assignedAt: string
  assignedBy: string
}

export interface SimConsent {
  id: string
  credentialId: string
  doctorAddress: string
  patientAddress: string
  grantedAt: string
  revoked: boolean
}

export interface SimCredential {
  id: string
  credentialId: string
  patientAddress: string
  dataHash: string
  expiryDate: string
  issuedAt: string
  issuedBy: string
  status: "active" | "revoked"
  revokedAt?: string
}

export interface SimVerification {
  id: string
  dataHash: string
  verifier: string
  timestamp: string
  result: "valid" | "invalid" | "revoked"
}

export interface SimActivityLog {
  time: string
  actor: string
  action: string
  detail: string
}

export interface SimulationState {
  roles: SimRole[]
  consents: SimConsent[]
  credentials: SimCredential[]
  verifications: SimVerification[]
  activityLog: SimActivityLog[]
  paused: boolean
}

interface SimulationContextValue {
  sim: SimulationState
  // Role actions
  addDoctor: (address: string) => void
  removeDoctor: (address: string) => void
  addVerifier: (address: string) => void
  removeVerifier: (address: string) => void
  // Credential actions
  grantConsent: (doctorAddress: string, credentialId: string) => void
  issueCredential: (credentialId: string, patientAddress: string, dataHash: string, expiryDate: string) => void
  revokeCredential: (credentialId: string) => void
  // Verification actions
  verifyCredential: (dataHash: string) => { result: "valid" | "invalid" | "revoked" }
  // Contract actions
  togglePause: () => void
  // Computed stats
  stats: {
    totalCredentials: number
    activeCredentials: number
    revokedCredentials: number
    totalVerifications: number
    validVerifications: number
    failedVerifications: number
    consentCount: number
    doctorCount: number
    verifierCount: number
    adminCount: number
  }
  // Reset
  resetSimulation: () => void
}

// ─── Defaults ──────────────────────────────────────────────────────────

const ADMIN_ADDRESS = "mn_admin_deployer_0x3a3c5091"
const STORAGE_KEY = "careproof-simulation"

const defaultState: SimulationState = {
  roles: [],
  consents: [],
  credentials: [],
  verifications: [],
  activityLog: [
    {
      time: new Date().toLocaleTimeString(),
      actor: "System",
      action: "Contract deployed on",
      detail: "Localnet",
    },
  ],
  paused: false,
}

// ─── Context ───────────────────────────────────────────────────────────

const SimulationContext = createContext<SimulationContextValue | null>(null)

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider")
  return ctx
}

// ─── Helper ────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function shortAddr(addr: string): string {
  if (addr.length > 20) return addr.slice(0, 10) + "..." + addr.slice(-6)
  return addr
}

// ─── Provider ──────────────────────────────────────────────────────────

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [sim, setSim] = useState<SimulationState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSim(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sim))
    }
  }, [sim, hydrated])

  const addLog = useCallback((actor: string, action: string, detail: string) => {
    const entry: SimActivityLog = {
      time: new Date().toLocaleTimeString(),
      actor,
      action,
      detail,
    }
    return entry
  }, [])

  // ── Role actions ───────────────────────────────────────────────────

  const addDoctor = useCallback((address: string) => {
    setSim((prev) => {
      if (prev.roles.some((r) => r.address === address && r.role === "doctor")) return prev
      const role: SimRole = {
        address,
        role: "doctor",
        assignedAt: new Date().toISOString(),
        assignedBy: ADMIN_ADDRESS,
      }
      return {
        ...prev,
        roles: [...prev.roles, role],
        activityLog: [addLog("Admin", "granted DOCTOR role to", shortAddr(address)), ...prev.activityLog],
      }
    })
  }, [addLog])

  const removeDoctor = useCallback((address: string) => {
    setSim((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => !(r.address === address && r.role === "doctor")),
      activityLog: [addLog("Admin", "revoked DOCTOR role from", shortAddr(address)), ...prev.activityLog],
    }))
  }, [addLog])

  const addVerifier = useCallback((address: string) => {
    setSim((prev) => {
      if (prev.roles.some((r) => r.address === address && r.role === "verifier")) return prev
      const role: SimRole = {
        address,
        role: "verifier",
        assignedAt: new Date().toISOString(),
        assignedBy: ADMIN_ADDRESS,
      }
      return {
        ...prev,
        roles: [...prev.roles, role],
        activityLog: [addLog("Admin", "granted VERIFIER role to", shortAddr(address)), ...prev.activityLog],
      }
    })
  }, [addLog])

  const removeVerifier = useCallback((address: string) => {
    setSim((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => !(r.address === address && r.role === "verifier")),
      activityLog: [addLog("Admin", "revoked VERIFIER role from", shortAddr(address)), ...prev.activityLog],
    }))
  }, [addLog])

  // ── Credential actions ─────────────────────────────────────────────

  const grantConsent = useCallback((doctorAddress: string, credentialId: string) => {
    setSim((prev) => {
      const consent: SimConsent = {
        id: generateId(),
        credentialId,
        doctorAddress,
        patientAddress: ADMIN_ADDRESS,
        grantedAt: new Date().toISOString(),
        revoked: false,
      }
      return {
        ...prev,
        consents: [...prev.consents, consent],
        activityLog: [addLog("Patient", "granted consent for credential", `#${credentialId} to ${shortAddr(doctorAddress)}`), ...prev.activityLog],
      }
    })
  }, [addLog])

  const issueCredential = useCallback((credentialId: string, patientAddress: string, dataHash: string, expiryDate: string) => {
    setSim((prev) => {
      const credential: SimCredential = {
        id: generateId(),
        credentialId,
        patientAddress,
        dataHash,
        expiryDate,
        issuedAt: new Date().toISOString(),
        issuedBy: ADMIN_ADDRESS,
        status: "active",
      }
      return {
        ...prev,
        credentials: [...prev.credentials, credential],
        activityLog: [addLog("Doctor", "issued credential", `#${credentialId} to ${shortAddr(patientAddress)}`), ...prev.activityLog],
      }
    })
  }, [addLog])

  const revokeCredential = useCallback((credentialId: string) => {
    setSim((prev) => ({
      ...prev,
      credentials: prev.credentials.map((c) =>
        c.credentialId === credentialId && c.status === "active"
          ? { ...c, status: "revoked" as const, revokedAt: new Date().toISOString() }
          : c
      ),
      activityLog: [addLog("Doctor", "revoked credential", `#${credentialId}`), ...prev.activityLog],
    }))
  }, [addLog])

  // ── Verification actions ───────────────────────────────────────────

  const verifyCredential = useCallback((dataHash: string): { result: "valid" | "invalid" | "revoked" } => {
    const credential = sim.credentials.find((c) => c.dataHash === dataHash)
    let result: "valid" | "invalid" | "revoked"
    if (!credential) {
      result = "invalid"
    } else if (credential.status === "revoked") {
      result = "revoked"
    } else {
      result = "valid"
    }

    const verification: SimVerification = {
      id: generateId(),
      dataHash,
      verifier: ADMIN_ADDRESS,
      timestamp: new Date().toISOString(),
      result,
    }

    setSim((prev) => ({
      ...prev,
      verifications: [...prev.verifications, verification],
      activityLog: [addLog("Verifier", `verified credential (${result})`, `hash: ${dataHash.slice(0, 16)}...`), ...prev.activityLog],
    }))

    return { result }
  }, [sim.credentials, addLog])

  // ── Contract actions ───────────────────────────────────────────────

  const togglePause = useCallback(() => {
    setSim((prev) => ({
      ...prev,
      paused: !prev.paused,
      activityLog: [addLog("Admin", prev.paused ? "unpaused contract" : "paused contract", ""), ...prev.activityLog],
    }))
  }, [addLog])

  // ── Reset ──────────────────────────────────────────────────────────

  const resetSimulation = useCallback(() => {
    setSim(defaultState)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // ── Computed stats ─────────────────────────────────────────────────

  const stats = {
    totalCredentials: sim.credentials.length,
    activeCredentials: sim.credentials.filter((c) => c.status === "active").length,
    revokedCredentials: sim.credentials.filter((c) => c.status === "revoked").length,
    totalVerifications: sim.verifications.length,
    validVerifications: sim.verifications.filter((v) => v.result === "valid").length,
    failedVerifications: sim.verifications.filter((v) => v.result !== "valid").length,
    consentCount: sim.consents.length,
    doctorCount: sim.roles.filter((r) => r.role === "doctor").length,
    verifierCount: sim.roles.filter((r) => r.role === "verifier").length,
    adminCount: 1, // deployer is always admin
  }

  return (
    <SimulationContext.Provider
      value={{
        sim,
        addDoctor,
        removeDoctor,
        addVerifier,
        removeVerifier,
        grantConsent,
        issueCredential,
        revokeCredential,
        verifyCredential,
        togglePause,
        stats,
        resetSimulation,
      }}
    >
      {children}
    </SimulationContext.Provider>
  )
}
