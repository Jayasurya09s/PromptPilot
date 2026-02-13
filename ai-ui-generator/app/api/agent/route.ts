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

import { planner } from "@/lib/agents/planner";
import { generator } from "@/lib/agents/generator";
import { explainer } from "@/lib/agents/explainer";
import { detectPromptInjection } from "@/lib/security";
import { diffTrees } from "@/lib/diff";
import { connectDB } from "@/lib/db";
import { extractToken, verifyToken } from "@/lib/auth";
import { applyDailyCredits, getDailyCredits, getTodayUtcDate } from "@/lib/credits";
import Session from "@/models/Session";
import User from "@/models/User";

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

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${payload}\n\n`));
      };

      const addLog = (message: string) => {
        console.log(message);
        sendEvent("log", message);
      };

      const sendProgress = () => {
        sendEvent("progress", progress);
      };

      const sendDone = (payload: Record<string, unknown>) => {
        sendEvent("done", payload);
      };

      const run = async () => {
        try {
          sendProgress();

          // 🔐 AUTHENTICATION: Verify JWT token
          const authHeader = req.headers.get("authorization");
          const token = extractToken(authHeader);

          if (!token) {
            sendEvent("error", { error: "Unauthorized: No token provided" });
            sendDone({ success: false, error: "Unauthorized: No token provided" });
            return;
          }

          const payload = verifyToken(token);
          if (!payload) {
            sendEvent("error", { error: "Unauthorized: Invalid token" });
            sendDone({ success: false, error: "Unauthorized: Invalid token" });
            return;
          }

          addLog(`✓ Auth verified for user: ${payload.email}`);

          // 💳 CREDITS: Verify and decrement daily credits
          await connectDB();
          const user = await User.findById(payload.userId);
          if (!user) {
            sendEvent("error", { error: "Unauthorized: User not found" });
            sendDone({ success: false, error: "Unauthorized: User not found" });
            return;
          }

          const didReset = applyDailyCredits(user);
          if (didReset) {
            await user.save();
          }

          const todayKey = getTodayUtcDate().toISOString().slice(0, 10);
          const createdKey = user.createdAt?.toISOString().slice(0, 10);
          const creditsUsed = getDailyCredits() - user.creditsRemaining;
          const isNewUser = createdKey === todayKey && creditsUsed < getDailyCredits();

          const apiKeys = (isNewUser
            ? [
                process.env.OPENROUTER_API_KEY,
                process.env.OPENROUTER_API_KEY_SECONDARY,
                process.env.OPENROUTER_API_KEY_BACKUP,
              ]
            : [process.env.OPENROUTER_API_KEY]
          ).filter(Boolean) as string[];

          if (isNewUser && apiKeys.length > 1) {
            addLog("Using fallback API keys for new-user quota.");
          }

          if (user.creditsRemaining <= 0) {
            sendEvent("error", { error: "Daily credits exhausted. Try again after reset." });
            sendDone({
              success: false,
              error: "Daily credits exhausted. Try again after reset.",
              creditsRemaining: 0,
              dailyCredits: getDailyCredits(),
            });
            return;
          }

          user.creditsRemaining -= 1;
          await user.save();
          const creditsRemaining = user.creditsRemaining;

          const { intent, previousTree } = await req.json();

          // 🔍 SECURITY: Check for prompt injection attacks
          progress[0].completed = true;
          progress[0].timestamp = Date.now() - startTime;
          sendProgress();
          addLog(`✓ Security check passed: ${progress[0].timestamp}ms`);

          const injectionError = detectPromptInjection(intent);
          if (injectionError) {
            sendEvent("error", { error: "Prompt violates system constraints." });
            sendDone({
              success: false,
              error: "Prompt violates system constraints.",
              progress,
            });
            return;
          }

          // 🎯 PLANNER: Create structured UI plan from intent
          addLog("Attempting planner...");
          const plan = await planner(intent, previousTree, addLog, apiKeys);
          progress[1].completed = true;
          progress[1].timestamp = Date.now() - startTime;
          sendProgress();
          addLog(`✓ Planner succeeded: ${progress[1].timestamp}ms`);

          // 🏗️ GENERATOR: Convert plan to validated UI tree
          addLog("Generating tree from plan...");
          const tree = generator(plan);
          progress[2].completed = true;
          progress[2].timestamp = Date.now() - startTime;
          sendProgress();
          addLog(`✓ Tree generated: ${progress[2].timestamp}ms`);
          addLog("✅ Tree generated and validated successfully");

          // ✅ VALIDATOR: Already ran in generator
          progress[3].completed = true;
          progress[3].timestamp = Date.now() - startTime;
          sendProgress();
          addLog(`✓ Validation passed: ${progress[3].timestamp}ms`);

          // 🧠 EXPLAINER: Generate human-readable explanation
          addLog("[Explainer] Attempting explanation...");
          const explanation = await explainer(tree, addLog, apiKeys);
          progress[4].completed = true;
          progress[4].timestamp = Date.now() - startTime;
          sendProgress();
          addLog(`✓ Explainer succeeded: ${progress[4].timestamp}ms`);

          // 📊 DIFF: Calculate changes from previous version
          const diff = diffTrees(previousTree || null, tree);

          // 🎉 COMPLETE
          progress[5].completed = true;
          progress[5].timestamp = Date.now() - startTime;
          sendProgress();
          addLog(`✓ Complete: ${progress[5].timestamp}ms`);

          // 💾 DATABASE: Save version to session
          await connectDB();

          let session;
          const sessionId = req.headers.get("x-session-id");

          if (!sessionId) {
            // Create new session for user
            session = await Session.create({
              userId: payload.userId,
              versions: [],
            });
          } else {
            // Find existing session and verify ownership
            session = await Session.findOne({
              _id: sessionId,
              userId: payload.userId,
            });
            if (!session) {
              sendEvent("error", { error: "Session not found." });
              sendDone({ success: false, error: "Session not found.", progress });
              return;
            }
          }

          // Add new version to session
          session.versions.push({
            intent,
            plan,
            tree,
            explanation,
            diff,
          });

          await session.save();
          addLog("✓ Saved to DB");

          // Return successful response
          sendDone({
            success: true,
            plan: tree,
            explanation,
            diff,
            progress,
            sessionId: session._id.toString(),
            creditsRemaining,
            dailyCredits: getDailyCredits(),
          });
        } catch (error: any) {
          // Mark current step as failed
          const failedIndex = progress.findIndex((p) => !p.completed);
          if (failedIndex >= 0) {
            progress[failedIndex].timestamp = Date.now() - startTime;
          }

          console.error("[API Error]", error);
          sendEvent("error", { error: error.message || "System failure." });
          sendDone({
            success: false,
            error: error.message || "System failure.",
            progress,
          });
        } finally {
          controller.close();
        }
      };

      void run();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
