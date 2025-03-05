import { NextResponse } from "next/server"
import { connectToDatabase, InventoryItem, Alert, ActivityLog } from "@/server/db"

// This is a simplified theft detection algorithm
// In a real application, this would be more sophisticated
// and potentially use machine learning models
export async function POST() {
  try {
    await connectToDatabase()

    // Get all inventory items
    const items = await InventoryItem.find()

    // Get recent activity logs for inventory changes
    const recentLogs = await ActivityLog.find({
      type: "inventory",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    }).populate("user")

    const alerts = []

    // Check for unusual quantity reductions
    for (const log of recentLogs) {
      if (log.action === "updated" && log.details && log.details.changes) {
        const { changes } = log.details

        // If quantity was reduced by more than 5 items
        if (changes.quantity !== undefined && changes.quantity < 0 && Math.abs(changes.quantity) > 5) {
          // Find the item
          const item = items.find((i) => i._id.toString() === log.details.itemId.toString())

          if (item) {
            // Create an alert
            const alert = new Alert({
              title: "Unusual Inventory Reduction",
              description: `${Math.abs(changes.quantity)} ${item.name} items were removed at once. This may indicate theft.`,
              severity: "high",
              location: item.location,
            })

            await alert.save()
            alerts.push(alert)

            // Log the alert
            await ActivityLog.create({
              type: "alert",
              action: "triggered",
              item: "Theft Detection System",
              details: { alertId: alert._id, itemId: item._id },
            })
          }
        }
      }
    }

    // Check for inventory discrepancies
    // This would typically involve comparing physical counts with system counts
    // For this example, we'll simulate some discrepancies

    // Simulate a 5% chance of finding a discrepancy for each item
    for (const item of items) {
      if (Math.random() < 0.05) {
        const missingQuantity = Math.floor(Math.random() * 5) + 1

        const alert = new Alert({
          title: "Inventory Discrepancy",
          description: `Physical count shows ${missingQuantity} ${item.name} missing from system records.`,
          severity: "medium",
          location: item.location,
        })

        await alert.save()
        alerts.push(alert)

        // Log the alert
        await ActivityLog.create({
          type: "alert",
          action: "triggered",
          item: "Theft Detection System",
          details: { alertId: alert._id, itemId: item._id },
        })
      }
    }

    return NextResponse.json({
      success: true,
      alertsGenerated: alerts.length,
      alerts,
    })
  } catch (error) {
    console.error("Error in theft detection:", error)
    return NextResponse.json({ error: "Failed to run theft detection" }, { status: 500 })
  }
}

