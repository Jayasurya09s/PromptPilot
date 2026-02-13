import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";
import { getDailyCredits, getTodayUtcDate } from "@/lib/credits";
import User from "@/models/User";

/**
 * POST /api/auth/register
 * 
 * Register a new user
 * 
 * @param req - Request body { email, password, name? }
 * @returns { success, token, user }
 */
export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Connect to DB
    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      creditsRemaining: getDailyCredits(),
      lastCreditReset: getTodayUtcDate(),
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        creditsRemaining: user.creditsRemaining,
      },
      dailyCredits: getDailyCredits(),
    });
  } catch (error: any) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
