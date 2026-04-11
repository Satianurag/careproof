import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono as GeistMono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const geistMono = GeistMono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CareProof Dashboard",
  description: "Privacy-preserving healthcare credential verification on Midnight Network",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "CareProof Dashboard",
    description: "Privacy-preserving healthcare credential verification on Midnight Network",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CareProof Dashboard",
    description: "Privacy-preserving healthcare credential verification on Midnight Network",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistMono.className} antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#171717",
              border: "1px solid #404040",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  )
}
