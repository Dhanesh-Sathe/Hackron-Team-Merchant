"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Package, UserPlus, Edit, AlertTriangle } from "lucide-react"

// Sample activity data
const activities = [
  {
    id: 1,
    type: "inventory",
    action: "added",
    user: "John Doe",
    userInitials: "JD",
    item: "Laptop Dell XPS 13",
    time: "2 hours ago",
    icon: Package,
  },
  {
    id: 2,
    type: "user",
    action: "created",
    user: "Admin",
    userInitials: "AD",
    item: "New employee account",
    time: "5 hours ago",
    icon: UserPlus,
  },
  {
    id: 3,
    type: "inventory",
    action: "updated",
    user: "Jane Smith",
    userInitials: "JS",
    item: "Office Chair quantity",
    time: "Yesterday",
    icon: Edit,
  },
  {
    id: 4,
    type: "alert",
    action: "triggered",
    user: "System",
    userInitials: "SY",
    item: "Unusual activity in Warehouse B",
    time: "Yesterday",
    icon: AlertTriangle,
  },
  {
    id: 5,
    type: "inventory",
    action: "added",
    user: "Mike Johnson",
    userInitials: "MJ",
    item: "Wireless Keyboard",
    time: "2 days ago",
    icon: Package,
  },
]

export function RecentActivities() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <Avatar className="h-9 w-9 mr-3">
            <AvatarImage src={`/placeholder-user.jpg`} alt={activity.user} />
            <AvatarFallback>{activity.userInitials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
              <span className="font-semibold">{activity.item}</span>
            </p>
            <p className="text-sm text-muted-foreground">{activity.time}</p>
          </div>
          <div className="ml-auto">
            <activity.icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  )
}

