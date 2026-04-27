import { AsyncLocalStorage } from "node:async_hooks"

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

export function runWithContext<T>(context: ApiContext, fn: () => T): T {
  return apiContext.run(context, fn)
}
