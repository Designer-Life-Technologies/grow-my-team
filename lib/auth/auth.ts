import NextAuth, { getServerSession } from "next-auth"
import { authConfig } from "./auth.config"

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }

// For server-side session access
export const auth = () => getServerSession(authConfig)
