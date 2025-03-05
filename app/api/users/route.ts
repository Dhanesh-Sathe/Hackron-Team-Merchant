import { NextResponse } from "next/server"
import { connectToDatabase, User, ActivityLog } from "@/server/db"
import { hashPassword } from "@/server/auth"

// Get all users
export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    // Build query
    const query: any = {}
    if (role) query.role = role

    // Exclude password from results
    const users = await User.find(query, { password: 0 }).sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// Create a new user
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { name, email, password, role, adminId } = data

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
    })

    await newUser.save()

    // Log activity
    if (adminId) {
      await ActivityLog.create({
        type: "user",
        action: "created",
        user: adminId,
        item: `User: ${name}`,
        details: { userId: newUser._id },
      })
    }

    // Return user without password
    const userResponse = { ...newUser.toObject() }
    delete userResponse.password

    return NextResponse.json(userResponse, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

