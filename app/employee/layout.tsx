import type React from "react"
import { EmployeeSidebar } from "@/components/employee-sidebar"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <EmployeeSidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

