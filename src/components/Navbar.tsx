import { Link } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Settings, QrCode } from "lucide-react"
import { useAuth } from '@/lib/auth-context'
import { usePermissions } from '@/hooks/usePermissions'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export function Navbar() {
  const { user, signOut } = useAuth()
  const { isAdmin } = usePermissions()

  return (
    <nav className="w-full bg-background/50 backdrop-blur-sm border-b shadow-md py-4 transition-colors">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-8">
          <img 
            src="https://i.imgur.com/VCWYTQY.png" 
            alt="Logo" 
            className="h-8 w-auto"
          />
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={navigationMenuTriggerStyle()}>
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/throne" className={navigationMenuTriggerStyle()}>
                  Throne
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/orders" className={navigationMenuTriggerStyle()}>
                  Orders
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/inventory" className={navigationMenuTriggerStyle()}>
                  Inventory
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/production" className={navigationMenuTriggerStyle()}>
                  Production
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/requests" className={navigationMenuTriggerStyle()}>
                  Requests
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/scanner" className={navigationMenuTriggerStyle()}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Scanner
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4">
              <NotificationBell />
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}