import { Link } from "react-router-dom"
import { ModeToggle } from "./mode-toggle"
import { NotificationsPopover } from "./notifications/NotificationsPopover"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Denim Workshop</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/inventory"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Inventory
            </Link>
            <Link
              to="/production"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Production
            </Link>
            <Link
              to="/patterns"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Patterns
            </Link>
            <Link
              to="/orders"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Orders
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <NotificationsPopover />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
} 