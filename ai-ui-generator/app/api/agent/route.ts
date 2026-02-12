import { NextResponse } from "next/server";
import { planner } from "@/lib/agents/planner";
import { explainer } from "@/lib/agents/explainer";

export async function POST(req: Request) {
  try {
    const { intent, previousTree } = await req.json();

    const plan = await planner(intent, previousTree);
    const explanation = await explainer(plan);

    return NextResponse.json({
      success: true,
      plan,
      explanation,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
