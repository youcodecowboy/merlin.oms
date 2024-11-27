import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationBell } from '@/components/NotificationBell'
import { useLocation } from 'react-router-dom'
import { Home, Package, Box, Factory, FileText, QrCode, Scissors, Loader2 } from 'lucide-react'

const mainNav = [
  { title: "Home", href: "/", icon: Home },
  { title: "Orders", href: "/orders", icon: FileText },
  { title: "Inventory", href: "/inv", icon: Box },
  { title: "Production", href: "/production", icon: Factory },
  { title: "Patterns", href: "/patterns", icon: Scissors },
  { title: "Requests", href: "/requests", icon: FileText },
  { title: "Scanner", href: "/scanner", icon: QrCode },
  { title: "Wash", href: "/wash", icon: Loader2 }
]

export function MainHeader() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold">merlin</span>
          </Link>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainNav.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  isActive(item.href) ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <div className="flex items-center gap-x-2">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <NotificationBell />
          <Link to="/dev">
            <Button variant="ghost" size="icon" className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="h-5 w-5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 14l6-6m6 6l-6-6" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 20l8-8 8 8M4 4l8 8 8-8" 
                />
              </svg>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 