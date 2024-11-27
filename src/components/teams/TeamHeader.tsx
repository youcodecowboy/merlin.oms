import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/NotificationBell'
import { useLocation } from 'react-router-dom'
import { Box, FileText, QrCode, Package, Settings } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

const WAREHOUSE_NAV = [
  { title: "Requests", href: "/requests", icon: FileText },
  { title: "Inventory", href: "/inv", icon: Box },
  { title: "Scanner", href: "/scanner", icon: QrCode },
]

const QC_NAV = [
  { title: "Requests", href: "/requests", icon: FileText },
  { title: "Inventory", href: "/inv", icon: Box },
]

export type TeamType = 'WAREHOUSE' | 'QC' | 'FINISHING' | 'PATTERN'

interface TeamHeaderProps {
  teamType: TeamType
}

export function TeamHeader({ teamType }: TeamHeaderProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  // Get navigation items based on team type
  const getNavItems = () => {
    switch (teamType) {
      case 'WAREHOUSE':
        return WAREHOUSE_NAV
      case 'QC':
        return QC_NAV
      default:
        return []
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <div className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold">{teamType} Team</span>
          </div>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            {getNavItems().map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  isActive(item.href) ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <div className="flex items-center gap-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <NotificationBell />
          <Link to="/dev">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Dev Panel
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
} 