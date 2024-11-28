import { NavLink } from 'react-router-dom'

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <NavLink 
        to="/orders"
        className={({ isActive }) => 
          `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`
        }
      >
        Orders
      </NavLink>
      <NavLink
        to="/inventory"
        className={({ isActive }) => 
          `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`
        }
      >
        Inventory
      </NavLink>
      <NavLink
        to="/events"
        className={({ isActive }) => 
          `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`
        }
      >
        Events
      </NavLink>
    </nav>
  )
} 