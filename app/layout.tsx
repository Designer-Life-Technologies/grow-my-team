import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/lib/theme"
import "./globals.css"
import { Suspense } from "react"
import { ClientFavicon } from "@/components/ClientFavicon"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Grow My Team",
  description: "AI Recruitment Agent",
  icons: {
    icon: "/favicon.ico",
  },
}

// Client component handles dynamic favicon updates

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <ClientFavicon />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
