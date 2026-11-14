import type { Metadata } from "next"
import { Space_Grotesk, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
})

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Headly — AI-Powered Headless CMS",
  description:
    "Turn website HTML sections into JSON content APIs. Manage pages, blogs, SEO, users, and activity logs.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} min-h-svh font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
