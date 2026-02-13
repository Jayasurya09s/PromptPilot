import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { extractToken, verifyToken } from "@/lib/auth";
import Session from "@/models/Session";

/**
 * GET /api/sessions
 * 
 * Load all sessions for authenticated user
 * 
 * @returns { success, sessions }
 */
export async function GET(req: Request) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Connect to DB and fetch user sessions
    await connectDB();
    const sessions = await Session.find({ userId: payload.userId })
      .sort({ updatedAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session._id.toString(),
        versions: session.versions,
        updatedAt: session.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("[Sessions Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}
