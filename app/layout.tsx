import type React from "react"
import type { Metadata } from "next"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"
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
                <SignedOut>
                  <SignInButton mode="modal" />
                  <SignUpButton mode="modal" />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
