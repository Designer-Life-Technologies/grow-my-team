"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import type { ClientConfig } from "@/lib/config/client-config"

interface ClientConfigContextValue {
  config: ClientConfig
}

const ClientConfigContext = createContext<ClientConfigContextValue | undefined>(
  undefined,
)

interface ClientConfigProviderProps {
  children: ReactNode
  config: ClientConfig
}

export function ClientConfigProvider({
  children,
  config,
}: ClientConfigProviderProps) {
  const value: ClientConfigContextValue = { config }

  return (
    <ClientConfigContext.Provider value={value}>
      {children}
    </ClientConfigContext.Provider>
  )
}

export function useClientConfig(): ClientConfig {
  const context = useContext(ClientConfigContext)
  if (context === undefined) {
    throw new Error(
      "useClientConfig must be used within a ClientConfigProvider",
    )
  }
  return context.config
}
