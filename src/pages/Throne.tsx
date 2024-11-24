import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Box, 
  ClipboardList, 
  Users, 
  Settings, 
  Truck, 
  Factory,
  Boxes,
  Workflow,
  Scan,
  History,
  FileText,
  AlertCircle
} from "lucide-react"

export function Throne() {
  const pages = {
    core: [
      { name: "Dashboard", path: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
      { name: "Orders", path: "/orders", icon: <ShoppingCart className="h-4 w-4" /> },
      { name: "Inventory", path: "/inventory", icon: <Box className="h-4 w-4" /> },
      { name: "Requests", path: "/requests", icon: <ClipboardList className="h-4 w-4" /> },
    ],
    production: [
      { name: "Production Queue", path: "/production", icon: <Factory className="h-4 w-4" /> },
      { name: "Batches", path: "/batches", icon: <Boxes className="h-4 w-4" /> },
      { name: "Workflow", path: "/workflow", icon: <Workflow className="h-4 w-4" /> },
      { name: "Scanner", path: "/scanner", icon: <Scan className="h-4 w-4" /> },
    ],
    management: [
      { name: "Customers", path: "/customers", icon: <Users className="h-4 w-4" /> },
      { name: "Products", path: "/products", icon: <Box className="h-4 w-4" /> },
      { name: "Shipping", path: "/shipping", icon: <Truck className="h-4 w-4" /> },
    ],
    system: [
      { name: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" /> },
      { name: "Event Log", path: "/events", icon: <History className="h-4 w-4" /> },
      { name: "Reports", path: "/reports", icon: <FileText className="h-4 w-4" /> },
      { name: "Issues", path: "/issues", icon: <AlertCircle className="h-4 w-4" /> },
    ]
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Features */}
        <Card>
          <CardHeader>
            <CardTitle>Core Features</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {pages.core.map((page) => (
              <Button
                key={page.path}
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to={page.path}>
                  {page.icon}
                  <span className="ml-2">{page.name}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Production */}
        <Card>
          <CardHeader>
            <CardTitle>Production</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {pages.production.map((page) => (
              <Button
                key={page.path}
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to={page.path}>
                  {page.icon}
                  <span className="ml-2">{page.name}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Management */}
        <Card>
          <CardHeader>
            <CardTitle>Management</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {pages.management.map((page) => (
              <Button
                key={page.path}
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to={page.path}>
                  {page.icon}
                  <span className="ml-2">{page.name}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {pages.system.map((page) => (
              <Button
                key={page.path}
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to={page.path}>
                  {page.icon}
                  <span className="ml-2">{page.name}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}