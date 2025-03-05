"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowUpRight } from "lucide-react"

// Sample theft alerts data
const theftAlerts = [
  {
    id: 1,
    title: "Unusual Inventory Reduction",
    description: "Electronics section in Warehouse A shows 5 laptops missing without checkout records.",
    severity: "high",
    time: "2 hours ago",
    location: "Warehouse A",
  },
  {
    id: 2,
    title: "After-hours Access",
    description: "Unauthorized access detected in Warehouse B at 11:45 PM.",
    severity: "critical",
    time: "Yesterday",
    location: "Warehouse B",
  },
  {
    id: 3,
    title: "Inventory Discrepancy",
    description: "Office supplies count doesn't match system records. 12 items unaccounted for.",
    severity: "medium",
    time: "3 days ago",
    location: "Warehouse C",
  },
]

export function TheftAlerts() {
  return (
    <div className="space-y-4">
      {theftAlerts.map((alert) => (
        <div key={alert.id} className="flex items-start p-4 border rounded-lg">
          <div className="mr-4">
            <AlertTriangle
              className={`h-5 w-5 ${
                alert.severity === "critical"
                  ? "text-destructive"
                  : alert.severity === "high"
                    ? "text-orange-500"
                    : "text-yellow-500"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{alert.title}</h3>
              <Badge
                variant={
                  alert.severity === "critical" ? "destructive" : alert.severity === "high" ? "outline" : "secondary"
                }
              >
                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  {alert.time} • {alert.location}
                </span>
              </div>
              <Button size="sm" variant="outline" className="gap-1">
                Investigate <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

