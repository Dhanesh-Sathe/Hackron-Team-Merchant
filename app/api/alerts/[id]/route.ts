import { NextResponse } from "next/server"
import { connectToDatabase, Alert, ActivityLog } from "@/server/db"

// Get a specific alert
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const alert = await Alert.findById(params.id).populate("resolvedBy", "name email")

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error fetching alert:", error)
    return NextResponse.json({ error: "Failed to fetch alert" }, { status: 500 })
  }
}

// Update an alert
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { title, description, severity, location, resolved, userId } = data

    // Find the alert
    const alert = await Alert.findById(params.id)

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    // Update the alert
    if (title) alert.title = title
    if (description) alert.description = description
    if (severity) alert.severity = severity
    if (location) alert.location = location

    // Handle resolution
    if (resolved !== undefined) {
      alert.resolved = resolved

      if (resolved && !alert.resolvedAt) {
        alert.resolvedAt = new Date()
        alert.resolvedBy = userId
      } else if (!resolved) {
        alert.resolvedAt = undefined
        alert.resolvedBy = undefined
      }
    }

    await alert.save()

    // Log activity
    await ActivityLog.create({
      type: "alert",
      action: resolved ? "resolved" : "updated",
      user: userId,
      item: alert.title,
      details: { alertId: alert._id },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}

// Delete an alert
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    // Get user ID from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Find the alert
    const alert = await Alert.findById(params.id)

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    // Store alert title before deletion
    const alertTitle = alert.title

    // Delete the alert
    await Alert.findByIdAndDelete(params.id)

    // Log activity
    if (userId) {
      await ActivityLog.create({
        type: "alert",
        action: "deleted",
        user: userId,
        item: alertTitle,
        details: { alertId: params.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 })
  }
}

