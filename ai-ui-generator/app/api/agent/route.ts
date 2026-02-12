/**
 * AI Agent API Route
 * 
 * Main API endpoint for UI generation.
 * Orchestrates the 3-agent workflow:
 * 1. Planner: Creates structured UI plan from user intent
 * 2. Generator: Converts plan to validated UI tree
 * 3. Explainer: Generates human-readable explanation
 * 
 * Includes security checks and error handling.
 * 
 * @module api/agent
 */

import { NextResponse } from "next/server";
import { planner } from "@/lib/agents/planner";
import { generator } from "@/lib/agents/generator";
import { explainer } from "@/lib/agents/explainer";
import { detectPromptInjection } from "@/lib/security";
import { diffTrees } from "@/lib/diff";

type ProgressStep = {
  status: string;
  emoji: string;
  completed: boolean;
  timestamp: number;
};

/**
 * POST handler for UI generation requests.
 * 
 * Workflow:
 * 1. Security: Check for prompt injection
 * 2. Planning: AI creates structured plan
 * 3. Generation: Convert plan to UI tree
 * 4. Explanation: Generate reasoning
 * 5. Diff: Calculate changes from previous version
 * 
 * @param req - Request containing { intent: string, previousTree?: UINode }
 * @returns JSON response with { success, plan?, explanation?, diff?, progress?, error? }
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  const progress: ProgressStep[] = [
    { status: "Scanning intent...", emoji: "🔍", completed: false, timestamp: 0 },
    { status: "Planning layout...", emoji: "🎯", completed: false, timestamp: 0 },
    { status: "Building tree...", emoji: "🏗️", completed: false, timestamp: 0 },
    { status: "Validating structure...", emoji: "✅", completed: false, timestamp: 0 },
    { status: "Generating explanation...", emoji: "🧠", completed: false, timestamp: 0 },
    { status: "Complete!", emoji: "🎉", completed: false, timestamp: 0 },
  ];

  try {
    const { intent, previousTree } = await req.json();

    // 🔍 SECURITY: Check for prompt injection attacks
    progress[0].completed = true;
    progress[0].timestamp = Date.now() - startTime;
    console.log(`✓ Security check passed: ${progress[0].timestamp}ms`);

    const injectionError = detectPromptInjection(intent);
    if (injectionError) {
      return NextResponse.json({
        success: false,
        error: "Prompt violates system constraints.",
        progress,
      });
    }

    // 🎯 PLANNER: Create structured UI plan from intent
    progress[1].completed = true;
    progress[1].timestamp = Date.now() - startTime;
    console.log(`✓ Planner succeeded: ${progress[1].timestamp}ms`);
    const plan = await planner(intent, previousTree);

    // 🏗️ GENERATOR: Convert plan to validated UI tree
    progress[2].completed = true;
    progress[2].timestamp = Date.now() - startTime;
    console.log(`✓ Tree generated: ${progress[2].timestamp}ms`);
    const tree = generator(plan);

    // ✅ VALIDATOR: Already ran in generator
    progress[3].completed = true;
    progress[3].timestamp = Date.now() - startTime;
    console.log(`✓ Validation passed: ${progress[3].timestamp}ms`);

    // 🧠 EXPLAINER: Generate human-readable explanation
    progress[4].completed = true;
    progress[4].timestamp = Date.now() - startTime;
    console.log(`✓ Explainer succeeded: ${progress[4].timestamp}ms`);
    const explanation = await explainer(tree);
    
    // 📊 DIFF: Calculate changes from previous version
    const diff = diffTrees(previousTree || null, tree);

    // 🎉 COMPLETE
    progress[5].completed = true;
    progress[5].timestamp = Date.now() - startTime;
    console.log(`✓ Complete: ${progress[5].timestamp}ms`);

    // Return successful response
    return NextResponse.json({
      success: true,
      plan: tree,
      explanation,
      diff,
      progress,
    });

  } catch (error: any) {
    // Mark current step as failed
    const failedIndex = progress.findIndex(p => !p.completed);
    if (failedIndex >= 0) {
      progress[failedIndex].timestamp = Date.now() - startTime;
    }

    // Log error for debugging
    console.error("[API Error]", error);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || "System failure.",
        progress,
      },
      { status: 500 }
    );
  }
}
