import { NextResponse } from "next/server"
import { connectToDatabase, InventoryItem, ActivityLog } from "@/server/db"

// Get a specific inventory item
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const item = await InventoryItem.findById(params.id)

    if (!item) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json({ error: "Failed to fetch inventory item" }, { status: 500 })
  }
}

// Update an inventory item
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { name, category, quantity, location, userId } = data

    // Find the item
    const item = await InventoryItem.findById(params.id)

    if (!item) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    // Determine status based on quantity
    let status = "In Stock"
    if (quantity <= 0) {
      status = "Out of Stock"
    } else if (quantity < 10) {
      status = "Low Stock"
    }

    // Update the item
    item.name = name || item.name
    item.category = category || item.category
    item.quantity = quantity !== undefined ? quantity : item.quantity
    item.location = location || item.location
    item.status = status
    item.lastUpdated = new Date()
    item.updatedBy = userId

    await item.save()

    // Log activity
    await ActivityLog.create({
      type: "inventory",
      action: "updated",
      user: userId,
      item: item.name,
      details: { itemId: item._id, changes: data },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 })
  }
}

// Delete an inventory item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    // Get user ID from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Find the item
    const item = await InventoryItem.findById(params.id)

    if (!item) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    // Store item name before deletion
    const itemName = item.name

    // Delete the item
    await InventoryItem.findByIdAndDelete(params.id)

    // Log activity
    if (userId) {
      await ActivityLog.create({
        type: "inventory",
        action: "deleted",
        user: userId,
        item: itemName,
        details: { itemId: params.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 })
  }
}

