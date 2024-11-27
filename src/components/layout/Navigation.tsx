import { Link } from 'react-router-dom'
import { Loader2 } from "lucide-react"
import { RequestsMenu } from '../navigation/RequestsMenu'

export function Navigation() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        to="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </Link>
      <Link
        to="/inventory"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Inventory
      </Link>
      <RequestsMenu />
      <Link
        to="/wash"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Wash
      </Link>
    </nav>
  )
} 