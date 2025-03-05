"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Users, AlertTriangle, Settings, LogOut, Menu, X } from "lucide-react"

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: Package,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Alerts",
      path: "/admin/alerts",
      icon: AlertTriangle,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div
        className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-100 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-card border-r transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                  pathname === route.path ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

