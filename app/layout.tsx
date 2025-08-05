import type React from "react"
import type { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: "Måltidsplanlægger",
  description: "Planlæg dine måltider efter uge",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="da">
      <body className="font-sans">{children}</body>
    </html>
  )
}
