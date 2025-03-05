import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { User } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: any) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await User.findOne({ email })

    if (!user) {
      return null
    }

    const isMatch = await comparePassword(password, user.password)

    if (!isMatch) {
      return null
    }

    return user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function registerUser(userData: any) {
  try {
    const { name, email, password, role } = userData

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return { error: "User already exists" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    })

    await newUser.save()

    return { user: newUser }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Registration failed" }
  }
}

