import { AsyncLocalStorage } from "node:async_hooks"
import { resolveClientConfig } from "@/lib/config/client-config"

interface ApiContext {
  apiEndpoint: string | null
  theme: string | null
  organisationId: string | null
}

const apiContext = new AsyncLocalStorage<ApiContext>()

export function setApiContext(context: ApiContext) {
  apiContext.enterWith(context)
}

export function getApiContext(): ApiContext {
  return (
    apiContext.getStore() || {
      apiEndpoint: null,
      theme: null,
      organisationId: null,
    }
  )
}

export function getOrganisationId(): string | null {
  const context = apiContext.getStore()
  return context?.organisationId || null
}

/**
 * Resolve client config and set API context in one call.
 * This is a helper for pages to set up the global API context.
 */
export async function setupApiContext(
  searchParams?: Record<string, string | undefined>,
): Promise<void> {
  const config = await resolveClientConfig(searchParams)
  setApiContext({
    apiEndpoint: config.apiEndpoint,
    theme: config.theme.id,
    organisationId: config.organisationId,
  })
}

export function runWithContext<T>(context: ApiContext, fn: () => T): T {
  return apiContext.run(context, fn)
}
