"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { useWallet } from "@/contexts/wallet-context"

export default function Page() {
  const { isConnected } = useWallet()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: isConnected differs server vs client
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className={isConnected ? "w-full max-w-lg" : "w-full max-w-sm"}>
        <LoginForm />
      </div>
    </div>
  )
}
