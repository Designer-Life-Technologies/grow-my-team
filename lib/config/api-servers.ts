/**
 * Available GetMe.video API servers for client configuration
 * Used when creating new clients to select the appropriate regional API endpoint
 */

export interface ApiServerOption {
  id: string
  name: string
  region: string
  endpoint: string
  description?: string
}

export const API_SERVERS: ApiServerOption[] = [
  {
    id: "default",
    name: "Default (Global)",
    region: "Global",
    endpoint: process.env.GETME_API_URL || "https://api.getme.video",
    description: "Default global API server",
  },
  {
    id: "au",
    name: "Australia",
    region: "APAC",
    endpoint: "https://aucmckpqa8.ap-southeast-2.awsapprunner.com/v1",
    description: "Australian regional API server",
  },
  {
    id: "za",
    name: "South Africa",
    region: "EMEA",
    endpoint:
      "https://sa-75061c149d4b4bb38829cbb2a364bc3c.ecs.af-south-1.on.aws",
    description: "South African regional API server",
  },
  {
    id: "eu",
    name: "Europe",
    region: "EMEA",
    endpoint: "https://api-eu.getme.video",
    description: "European regional API server",
  },
  {
    id: "us",
    name: "United States",
    region: "AMER",
    endpoint: "https://api-us.getme.video",
    description: "United States regional API server",
  },
]

/**
 * Get API server option by ID
 */
export function getApiServer(id: string): ApiServerOption | undefined {
  return API_SERVERS.find((server) => server.id === id)
}

/**
 * Get API server options for dropdown/select
 */
export function getApiServerOptions(): Array<{ value: string; label: string }> {
  return API_SERVERS.map((server) => ({
    value: server.id,
    label: `${server.name} (${server.region}) - ${server.endpoint}`,
  }))
}
