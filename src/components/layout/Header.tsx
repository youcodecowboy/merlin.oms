import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Navigation } from './Navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationBell } from '@/components/NotificationBell'
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold">merlin</span>
          </Link>
          <Navigation />
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