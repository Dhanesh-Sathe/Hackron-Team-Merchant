import { NextResponse } from "next/server"
import { connectToDatabase, ActivityLog } from "@/server/db"

// Get activity logs
export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const user = searchParams.get("user")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 50

    // Build query
    const query: any = {}
    if (type) query.type = type
    if (user) query.user = user

    const activities = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(limit).populate("user", "name email")

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 })
  }
}

