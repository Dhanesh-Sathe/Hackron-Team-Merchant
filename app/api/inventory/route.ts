import { NextResponse } from "next/server"
import { connectToDatabase, InventoryItem, ActivityLog } from "@/server/db"

// Get all inventory items
export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const status = searchParams.get("status")

    // Build query
    const query: any = {}
    if (category) query.category = category
    if (location) query.location = location
    if (status) query.status = status

    const items = await InventoryItem.find(query).sort({ lastUpdated: -1 })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory items" }, { status: 500 })
  }
}

// Create a new inventory item
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { name, category, quantity, location, userId } = data

    if (!name || !category || quantity === undefined || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine status based on quantity
    let status = "In Stock"
    if (quantity <= 0) {
      status = "Out of Stock"
    } else if (quantity < 10) {
      status = "Low Stock"
    }

    const newItem = new InventoryItem({
      name,
      category,
      quantity,
      location,
      status,
      updatedBy: userId,
    })

    await newItem.save()

    // Log activity
    await ActivityLog.create({
      type: "inventory",
      action: "added",
      user: userId,
      item: name,
      details: { itemId: newItem._id },
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
  }
}

