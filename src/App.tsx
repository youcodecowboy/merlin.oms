import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/lib/auth-context'
import { AuthGuard } from '@/components/AuthGuard'
import { MainHeader } from '@/components/MainHeader'
import { Home } from '@/pages/Home'
import { Orders } from '@/pages/Orders'
import { Inventory } from '@/pages/Inventory'
import { Production } from '@/pages/Production'
import { Requests } from '@/pages/Requests'
import { Scanner } from '@/pages/Scanner'
import { Patterns } from '@/pages/Patterns'
import { Wash } from '@/pages/Wash'
import { DevDashboard } from '@/pages/DevDashboard'
import { TeamViewContext } from '@/contexts/TeamViewContext'
import { InventoryItem } from '@/pages/InventoryItem'
import { Order } from '@/pages/Order'
import { Bin } from '@/pages/Bin'

export default function App() {
  const [currentView, setCurrentView] = useState('ADMIN')

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="throne-theme">
        <TooltipProvider>
          <AuthProvider>
            <TeamViewContext.Provider value={{ currentView, setCurrentView }}>
              <Router>
                <AuthGuard>
                  <div className="min-h-screen bg-background text-foreground transition-colors">
                    <MainHeader />
                    <Routes>
                      <Route path="/dev" element={<DevDashboard />} />
                      {currentView === 'ADMIN' && (
                        <>
                          <Route path="/" element={<Home />} />
                          <Route path="/orders" element={<Orders />} />
                          <Route path="/orders/:id" element={<Order />} />
                          <Route path="/inv" element={<Inventory />} />
                          <Route path="/inv/:id" element={<InventoryItem />} />
                          <Route path="/production" element={<Production />} />
                          <Route path="/patterns" element={<Patterns />} />
                          <Route path="/requests" element={<Requests />} />
                          <Route path="/scanner" element={<Scanner />} />
                          <Route path="/wash" element={<Wash />} />
                          <Route path="/bins/:id" element={<Bin />} />
                        </>
                      )}
                    </Routes>
                  </div>
                  <Toaster />
                </AuthGuard>
              </Router>
            </TeamViewContext.Provider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}