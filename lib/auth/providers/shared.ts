export type TokenResponse = {
  access_token: string
  token_type: "Bearer" | string
  expires_in: number
  scope: string
}

export function maskSecret(value: string | undefined, visiblePrefix = 4) {
  if (!value) return value
  if (value.length <= visiblePrefix) return "***"
  return `${value.slice(0, visiblePrefix)}***`
}
