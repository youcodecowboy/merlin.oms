import React from "react"
import { Header } from "./Header"
import { ThemeProvider } from "@/components/theme-provider"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
} 