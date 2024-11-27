'use client'

import * as React from "react"
import { Link } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const requestTypes = [
  {
    title: "Pattern Requests",
    href: "/requests/pattern",
    description: "Track and manage pattern creation requests"
  },
  {
    title: "Cutting Requests",
    href: "/requests/cutting",
    description: "Manage cutting orders and schedules"
  },
  {
    title: "QC Requests",
    href: "/requests/qc",
    description: "Quality control inspection requests"
  },
  {
    title: "Finishing Requests",
    href: "/requests/finishing",
    description: "Manage finishing and detailing requests"
  },
  {
    title: "Packing Requests",
    href: "/requests/packing",
    description: "Track packing and shipping requests"
  }
]

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={props.href || "#"}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function RequestsMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>REQUESTS</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {requestTypes.map((request) => (
                <ListItem
                  key={request.href}
                  title={request.title}
                  href={request.href}
                >
                  {request.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
} 