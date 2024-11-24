import { Link } from 'react-router-dom'
import { Scissors } from 'lucide-react'

export function Navigation() {
  return (
    <nav>
      {/* ... other navigation items */}
      <Link to="/patterns" className="flex items-center gap-2">
        <Scissors className="h-4 w-4" />
        Patterns
      </Link>
    </nav>
  )
} 