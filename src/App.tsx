import { Routes, Route } from 'react-router-dom'
import { MainHeader } from '@/components/MainHeader'
import { Home } from '@/pages/Home'
import { Orders } from '@/pages/Orders'
import { Order } from '@/pages/Order'
import { Inventory } from '@/pages/Inventory'
import { Production } from '@/pages/Production'
import { Patterns } from '@/pages/Patterns'
import { Requests } from '@/pages/Requests'
import { Scanner } from '@/pages/Scanner'
import { Wash } from '@/pages/Wash'
import { QC } from '@/pages/QC'
import { DevDashboard } from '@/pages/DevDashboard'
import { Bin } from '@/pages/Bin'
import { QCRequest } from '@/pages/QCRequest'
import { Events } from '@/pages/Events'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<Order />} />
        <Route path="/inv" element={<Inventory />} />
        <Route path="/production" element={<Production />} />
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/wash" element={<Wash />} />
        <Route path="/qc" element={<QC />} />
        <Route path="/qc/requests/:id" element={<QCRequest />} />
        <Route path="/dev" element={<DevDashboard />} />
        <Route path="/bins/:id" element={<Bin />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </div>
  )
}