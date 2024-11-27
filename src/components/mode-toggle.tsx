"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains('dark')
  )

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
    >
      {isDark ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 