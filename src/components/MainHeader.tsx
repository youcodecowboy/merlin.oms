import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { 
  Home, 
  ClipboardList, 
  Package, 
  Factory, 
  Scissors, 
  ScanLine, 
  Droplets,
  ShieldCheck,
  Settings,
  Terminal
} from "lucide-react"

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Package className="h-6 w-6" />
          <span>merlin</span>
        </Link>

        <div className="flex items-center gap-2 ml-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>

          <Link to="/orders">
            <Button variant="ghost" size="sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              Orders
            </Button>
          </Link>

          <Link to="/inv">
            <Button variant="ghost" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Button>
          </Link>

          <Link to="/production">
            <Button variant="ghost" size="sm">
              <Factory className="h-4 w-4 mr-2" />
              Production
            </Button>
          </Link>

          <Link to="/patterns">
            <Button variant="ghost" size="sm">
              <Scissors className="h-4 w-4 mr-2" />
              Patterns
            </Button>
          </Link>

          <Link to="/requests">
            <Button variant="ghost" size="sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              Requests
            </Button>
          </Link>

          <Link to="/scanner">
            <Button variant="ghost" size="sm">
              <ScanLine className="h-4 w-4 mr-2" />
              Scanner
            </Button>
          </Link>

          <Link to="/wash">
            <Button variant="ghost" size="sm">
              <Droplets className="h-4 w-4 mr-2" />
              Wash
            </Button>
          </Link>

          <Link to="/qc">
            <Button variant="ghost" size="sm">
              <ShieldCheck className="h-4 w-4 mr-2" />
              QC
            </Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/dev">
            <Button variant="ghost" size="sm">
              <Terminal className="h-4 w-4 mr-2" />
              Dev
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 