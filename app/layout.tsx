import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { AuthControls } from "@/components/auth-controls"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: "Måltidsplanlægger",
  description: "Hvad skal vi have at spise i aften?",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="da">
        <body className="font-sans">
          <header className="p-4 border-b">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">Måltidsplanlægger</h1>
              <div className="flex items-center gap-4">
                <AuthControls />
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
