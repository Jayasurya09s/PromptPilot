import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import { applyDailyCredits, getDailyCredits } from "@/lib/credits";
import User from "@/models/User";

/**
 * POST /api/auth/login
 * 
 * Authenticate user and return JWT token
 * 
 * @param req - Request body { email, password }
 * @returns { success, token, user }
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    // Connect to DB
    await connectDB();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Reset daily credits if needed
    const didReset = applyDailyCredits(user);
    if (didReset) {
      await user.save();
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

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
    console.error("[Login Error]", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
