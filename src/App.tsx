import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/lib/auth-context'
import { AuthGuard } from '@/components/AuthGuard'
import { Navbar } from '@/components/Navbar'
import { Home } from '@/pages/Home'
import { Throne } from '@/pages/Throne'
import OrdersPage from '@/pages/OrdersPage'
import { Inventory } from '@/pages/Inventory'
import { Production } from '@/pages/Production'
import { Requests } from '@/pages/Requests'
import { AdminPanel } from '@/pages/AdminPanel'
import { Scanner } from '@/pages/Scanner'
import { Patterns } from '@/pages/Patterns'
import { processUncommittedOrders } from '@/lib/mock/inventory/autoCommit'
import { useToast } from '@/components/ui/use-toast'

const RouteWithErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
)

export default function App() {
  const { toast } = useToast()

  useEffect(() => {
    const processOrders = async () => {
      try {
        const results = await processUncommittedOrders()
        
        // Count successful commitments
        const successfulCommitments = results.filter(r => r.success).length
        
        if (successfulCommitments > 0) {
          toast({
            title: "Orders Updated",
            description: `Successfully committed inventory for ${successfulCommitments} order(s)`,
          })
        }

        // Log detailed results
        console.group('Order Processing Results')
        results.forEach(result => {
          console.log(`Order #${result.orderNumber}:`, {
            success: result.success,
            message: result.message,
            items: result.items
          })
        })
        console.groupEnd()

      } catch (error) {
        console.error('Failed to process orders:', error)
        toast({
          title: "Error",
          description: "Failed to process pending orders",
          variant: "destructive"
        })
      }
    }

    processOrders()
  }, []) // Run once on mount

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <Router>
              <AuthGuard>
                <div className="min-h-screen bg-background text-foreground transition-colors">
                  <Navbar />
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <RouteWithErrorBoundary>
                          <Home />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/throne" 
                      element={
                        <RouteWithErrorBoundary>
                          <Throne />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/orders" 
                      element={
                        <RouteWithErrorBoundary>
                          <OrdersPage />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/inventory" 
                      element={
                        <RouteWithErrorBoundary>
                          <Inventory />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/production" 
                      element={
                        <RouteWithErrorBoundary>
                          <Production />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/requests" 
                      element={
                        <RouteWithErrorBoundary>
                          <Requests />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <RouteWithErrorBoundary>
                          <AdminPanel />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/scanner" 
                      element={
                        <RouteWithErrorBoundary>
                          <Scanner />
                        </RouteWithErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/patterns" 
                      element={
                        <RouteWithErrorBoundary>
                          <Patterns />
                        </RouteWithErrorBoundary>
                      } 
                    />
                  </Routes>
                </div>
                <Toaster />
              </AuthGuard>
            </Router>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}