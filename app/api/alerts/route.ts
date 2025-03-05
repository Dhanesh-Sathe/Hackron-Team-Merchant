import { NextResponse } from "next/server"
import { connectToDatabase, Alert, ActivityLog } from "@/server/db"

// Get all alerts
export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get("severity")
    const resolved = searchParams.get("resolved")
    const location = searchParams.get("location")

    // Build query
    const query: any = {}
    if (severity) query.severity = severity
    if (resolved) query.resolved = resolved === "true"
    if (location) query.location = location

    const alerts = await Alert.find(query).sort({ createdAt: -1 }).populate("resolvedBy", "name email")

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

// Create a new alert
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { title, description, severity, location, userId } = data

    if (!title || !description || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newAlert = new Alert({
      title,
      description,
      severity: severity || "medium",
      location,
    })

    await newAlert.save()

    // Log activity
    await ActivityLog.create({
      type: "alert",
      action: "created",
      user: userId,
      item: title,
      details: { alertId: newAlert._id },
    })

    return NextResponse.json(newAlert, { status: 201 })
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}

