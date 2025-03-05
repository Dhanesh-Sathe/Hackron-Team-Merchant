import { NextResponse } from "next/server"
import { connectToDatabase, User, ActivityLog } from "@/server/db"
import { hashPassword } from "@/server/auth"

// Get a specific user
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const user = await User.findById(params.id, { password: 0 })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// Update a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { name, email, password, role, adminId } = data

    // Find the user
    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user fields
    if (name) user.name = name
    if (email) user.email = email
    if (role) user.role = role

    // Update password if provided
    if (password) {
      user.password = await hashPassword(password)
    }

    await user.save()

    // Log activity
    if (adminId) {
      await ActivityLog.create({
        type: "user",
        action: "updated",
        user: adminId,
        item: `User: ${user.name}`,
        details: { userId: user._id },
      })
    }

    // Return user without password
    const userResponse = { ...user.toObject() }
    delete userResponse.password

    return NextResponse.json(userResponse)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// Delete a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    // Get admin ID from query params
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")

    // Find the user
    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Store user name before deletion
    const userName = user.name

    // Delete the user
    await User.findByIdAndDelete(params.id)

    // Log activity
    if (adminId) {
      await ActivityLog.create({
        type: "user",
        action: "deleted",
        user: adminId,
        item: `User: ${userName}`,
        details: { userId: params.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

