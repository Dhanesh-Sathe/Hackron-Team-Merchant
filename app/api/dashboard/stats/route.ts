import { NextResponse } from "next/server"
import { connectToDatabase, InventoryItem, User, Alert, ActivityLog } from "@/server/db"

export async function GET() {
  try {
    await connectToDatabase()

    // Get total inventory count
    const totalInventory = await InventoryItem.countDocuments()

    // Get low stock items count
    const lowStockItems = await InventoryItem.countDocuments({ status: "Low Stock" })

    // Get out of stock items count
    const outOfStockItems = await InventoryItem.countDocuments({ status: "Out of Stock" })

    // Get total users count
    const totalUsers = await User.countDocuments()

    // Get active alerts count
    const activeAlerts = await Alert.countDocuments({ resolved: false })

    // Get inventory value
    const inventoryItems = await InventoryItem.find()
    const inventoryValue = inventoryItems.reduce((total, item) => {
      // In a real app, each item would have a price field
      // For this example, we'll use a random value between $10 and $100
      const price = Math.floor(Math.random() * 90) + 10
      return total + price * item.quantity
    }, 0)

    // Get recent activities
    const recentActivities = await ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email")

    // Get inventory by category
    const categories = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Get inventory by location
    const locations = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { count: -1 } },
    ])

    return NextResponse.json({
      totalInventory,
      lowStockItems,
      outOfStockItems,
      totalUsers,
      activeAlerts,
      inventoryValue,
      recentActivities,
      inventoryByCategory: categories,
      inventoryByLocation: locations,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}

