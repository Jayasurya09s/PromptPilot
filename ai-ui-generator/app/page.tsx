/**
 * Main Application Page
 * 
 * Interactive UI generation interface with three panels:
 * 1. Left: Chat interface for user input and version history
 * 2. Middle: JSON code view of generated UI
 * 3. Right: Live preview of the UI
 * 
 * Features:
 * - AI-powered UI generation from natural language
 * - Version history with rollback capability
 * - Regeneration of current version
 * - Real-time diff tracking
 * - Error handling and user feedback
 * 
 * @module app/page
 */

"use client";

import { useState, useEffect } from "react";
import PreviewRenderer from "@/components/PreviewRenderer";
import AuthForm from "@/components/AuthForm";
import { UINode } from "@/lib/types";

/**
 * Represents a single version in the UI generation history.
 */
type Version = {
  /** The generated UI tree structure */
  plan: UINode;
  /** JSON string representation of the plan */
  code: string;
  /** AI-generated explanation of the UI */
  explanation: string;
  /** Original user intent that created this version */
  intent: string;
  /** Diff from previous version (if applicable) */
  diff?: {
    added: string[];
    removed: string[];
  };
};

/**
 * Main home page component.
 * Manages UI generation workflow and state.
 */
export default function Home() {
  // User's current input describing desired UI
  const [intent, setIntent] = useState<string>("");
  
  // Array of all generated UI versions
  const [versions, setVersions] = useState<Version[]>([]);
  
  // Index of currently displayed version (null if no versions)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  
  // Loading state during API calls
  const [loading, setLoading] = useState<boolean>(false);
  
  // Error message to display (null if no error)
  const [error, setError] = useState<string | null>(null);
  
  // Real-time progress updates showing each step
  const [progress, setProgress] = useState<Array<{
    status: string;
    emoji: string;
    completed: boolean;
    timestamp: number;
  }>>([]);

  // Logs array showing detailed console messages
  const [logs, setLogs] = useState<string[]>([]);

  // Session ID for persistent storage
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Authentication state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dailyCredits, setDailyCredits] = useState<number>(4);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);

  // Restore token from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");
      const savedDailyCredits = localStorage.getItem("daily_credits");
      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          if (typeof parsedUser.creditsRemaining === "number") {
            setCreditsRemaining(parsedUser.creditsRemaining);
          }
        }
      }
      if (savedDailyCredits) {
        const parsedCredits = Number(savedDailyCredits);
        if (!Number.isNaN(parsedCredits)) {
          setDailyCredits(parsedCredits);
        }
      }
    }
  }, []);

  // Load session history on token change
  useEffect(() => {
    const loadHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/sessions", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.sessions.length > 0) {
          // Load the most recent session's versions
          const latestSession = data.sessions[0];
          const loadedVersions = latestSession.versions.map((v: any) => ({
            plan: v.tree,
            code: JSON.stringify(v.tree, null, 2),
            explanation: v.explanation,
            intent: v.intent,
            diff: v.diff,
          }));
          setVersions(loadedVersions);
          setCurrentIndex(loadedVersions.length - 1);
          setSessionId(latestSession.id);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();
  }, [token]);

  // Get currently selected version or null
  const currentVersion =
    currentIndex !== null ? versions[currentIndex] : null;

  /**
   * Handle user login
   */
  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || "Login failed");
        return;
      }

      // Save token and user
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      if (typeof data.dailyCredits === "number") {
        localStorage.setItem("daily_credits", String(data.dailyCredits));
        setDailyCredits(data.dailyCredits);
      }
      setToken(data.token);
      setUser(data.user);
      if (typeof data.user?.creditsRemaining === "number") {
        setCreditsRemaining(data.user.creditsRemaining);
      }
      setShowAuth(false);
    } catch (err) {
      setAuthError("Login failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Handle user registration
   */
  const handleRegister = async (email: string, password: string, name?: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || "" }),
      });

      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || "Registration failed");
        return;
      }

      // Save token and user
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      if (typeof data.dailyCredits === "number") {
        localStorage.setItem("daily_credits", String(data.dailyCredits));
        setDailyCredits(data.dailyCredits);
      }
      setToken(data.token);
      setUser(data.user);
      if (typeof data.user?.creditsRemaining === "number") {
        setCreditsRemaining(data.user.creditsRemaining);
      }
      setShowAuth(false);
      setAuthMode("login");
    } catch (err) {
      setAuthError("Registration failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("daily_credits");
    setToken(null);
    setUser(null);
    setVersions([]);
    setCurrentIndex(null);
    setSessionId(null);
    setCreditsRemaining(0);
  };

  /**
   * Generates or regenerates UI based on user intent.
   * 
   * Makes API call to /api/agent with current intent and optional previous tree.
   * Updates version history and displays the new UI.
   * 
   * @param regenerate - If true, replaces last version instead of creating new one
   */
  const generateUI = async (regenerate = false) => {
    // Require non-empty input
    if (!intent.trim()) return;

    // Require authentication
    if (!token) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress([]);
    setLogs([]);

    try {
      // Call AI agent API
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(sessionId && { "x-session-id": sessionId }),
        },
        body: JSON.stringify({
          intent,
          previousTree: currentVersion?.plan || null,
        }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalPayload: any = null;

      const handleEvent = (eventName: string, data: string) => {
        if (!data) return;
        if (eventName === "log") {
          setLogs((prev) => [...prev, data]);
          return;
        }

        if (eventName === "progress") {
          try {
            const nextProgress = JSON.parse(data);
            if (Array.isArray(nextProgress)) {
              setProgress(nextProgress);
            }
          } catch {
            setError("Malformed progress update.");
          }
          return;
        }

        if (eventName === "error") {
          try {
            const parsed = JSON.parse(data);
            setError(parsed.error || "System failure.");
          } catch {
            setError(data);
          }
          return;
        }

        if (eventName === "done") {
          try {
            finalPayload = JSON.parse(data);
          } catch {
            setError("Malformed completion payload.");
          }
        }
      };

      const processChunk = (chunk: string) => {
        buffer += chunk;
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split("\n");
          let eventName = "message";
          const dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trimStart());
            }
          }

          const data = dataLines.join("\n");
          handleEvent(eventName, data);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        processChunk(decoder.decode(value, { stream: true }));
      }

      if (!finalPayload) {
        setError("Unexpected system error.");
        setLoading(false);
        return;
      }

      // Store session ID if returned
      if (finalPayload.sessionId) {
        setSessionId(finalPayload.sessionId);
      }

      // Update credits if returned
      if (typeof finalPayload.creditsRemaining === "number") {
        setCreditsRemaining(finalPayload.creditsRemaining);
        if (user) {
          const updatedUser = { ...user, creditsRemaining: finalPayload.creditsRemaining };
          setUser(updatedUser);
          localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        }
      }
      if (typeof finalPayload.dailyCredits === "number") {
        setDailyCredits(finalPayload.dailyCredits);
        localStorage.setItem("daily_credits", String(finalPayload.dailyCredits));
      }

      // Handle API errors
      if (!finalPayload.success) {
        setError(finalPayload.error);
        setLoading(false);
        return;
      }

      // Create new version entry
      const newVersion: Version = {
        plan: finalPayload.plan,
        code: JSON.stringify(finalPayload.plan, null, 2),
        explanation: finalPayload.explanation,
        intent,
        diff: finalPayload.diff,
      };

      // Update version history
      setVersions((prev) => {
        const updated = regenerate
          ? [...prev.slice(0, -1), newVersion] // Replace last
          : [...prev, newVersion]; // Add new

        setCurrentIndex(updated.length - 1);
        return updated;
      });

      // Clear progress after completion
      setTimeout(() => setProgress([]), 2000);

    } catch (err) {
      setError("Unexpected system error.");
    }

    setLoading(false);
  };

  /**
   * Rolls back to a previous version in history.
   * 
   * @param index - Index of version to restore
   */
  const rollbackTo = (index: number) => {
    setCurrentIndex(index);
    setIntent(versions[index].intent);
  };

  const authModal = (
    showAuth && !token && (
      <div className="modal-overlay" onClick={() => setShowAuth(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>{authMode === "login" ? "Login" : "Create Account"}</h3>
          <AuthForm
            mode={authMode}
            loading={authLoading}
            error={authError}
            onSubmit={authMode === "login" ? handleLogin : handleRegister}
            onToggleMode={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthError(null);
            }}
          />
        </div>
      </div>
    )
  );

  if (!token) {
    return (
      <div className="landing-shell">
        {authModal}
        <div className="landing-hero">
          <div className="landing-copy">
            <div className="landing-brand">
              <div className="landing-badge">AI UI Copilot</div>
              <div className="landing-logo">
                PromptPilot <span>Studio</span>
              </div>
            </div>
            <h1 className="landing-title">From prompt to polished UI in seconds.</h1>
            <p className="landing-subtitle">
              Turn natural language into production-ready layouts with validated
              component trees, live previews, and explanations you can trust.
            </p>
            <ul className="landing-points">
              <li>Schema-safe output every time</li>
              <li>Version history with instant rollbacks</li>
              <li>Diffs that show exactly what changed</li>
            </ul>
            <div className="landing-actions">
              <button className="btn btn-primary" onClick={() => setShowAuth(true)}>
                Login to Start
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setAuthMode("register");
                setShowAuth(true);
              }}>
                Create Account
              </button>
            </div>
            <div className="landing-stats">
              <div>
                <span>4</span>
                <span>Daily credits</span>
              </div>
              <div>
                <span>UTC</span>
                <span>Midnight reset</span>
              </div>
              <div>
                <span>Live</span>
                <span>Generation logs</span>
              </div>
            </div>
          </div>
          <div className="landing-shot">
            <img src="/homepage.png" alt="PromptPilot preview" />
          </div>
        </div>
        <div className="landing-grid">
          <div className="landing-card">
            <h3>Version history</h3>
            <p>Track every prompt and roll back to earlier iterations anytime.</p>
          </div>
          <div className="landing-card">
            <h3>Validated output</h3>
            <p>Every component is schema-checked for safe, predictable UI trees.</p>
          </div>
          <div className="landing-card">
            <h3>Daily credits</h3>
            <p>Start with 4 prompts per day, automatically refreshed at midnight UTC.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {authModal}

      {/* LEFT PANEL - AI CHAT */}
      <div className="panel chat-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0 }}>
            <span>🤖</span> AI Chat
          </h2>
          {token && user && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>{user.name || user.email}</span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          )}
          {!token && (
            <button
              onClick={() => setShowAuth(true)}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                background: "rgba(59, 130, 246, 0.2)",
                color: "#93c5fd",
                border: "1px solid rgba(59, 130, 246, 0.5)",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          )}
        </div>

        {token && (
          <div className="account-card">
            <div className="account-row">
              <span>Credits remaining</span>
              <span className="account-value">{creditsRemaining}/{dailyCredits}</span>
            </div>
            <div className="account-row">
              <span>Prompts used today</span>
              <span className="account-value">{Math.max(dailyCredits - creditsRemaining, 0)}</span>
            </div>
            <div className="account-sub">Resets at 12:00 AM UTC</div>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Describe your UI</label>
          <textarea
            className="text-input"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="e.g., Create a dashboard with a navbar and revenue card..."
            rows={5}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey && !loading) {
                generateUI(false);
              }
            }}
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
            Press Ctrl+Enter to generate
          </div>
        </div>

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={() => generateUI(false)}
            disabled={loading || !intent.trim()}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Generating..." : "✨ Generate UI"}
          </button>

          {currentVersion && (
            <button
              className="btn btn-secondary"
              onClick={() => generateUI(true)}
              disabled={loading}
            >
              🔄 Regenerate
            </button>
          )}
        </div>

        {/* LOADING STATUS */}
        {progress.length > 0 && (
          <div className="loading-status">
            <div className="progress-header">🚀 Generation in progress...</div>
            {progress.map((step, idx) => (
              <div key={idx} className={`progress-step ${step.completed ? 'completed' : ''}`}>
                <span className="step-emoji">{step.emoji}</span>
                <span className="step-status">{step.status}</span>
                {step.completed && <span className="step-check">✓</span>}
                {step.timestamp > 0 && <span className="step-time">{step.timestamp}ms</span>}
              </div>
            ))}
            {logs.length > 0 && (
              <div className="console-logs">
                <div className="console-header">
                  <span className="console-icon">●</span>
                  <span className="console-title">Live Console</span>
                </div>
                {logs.map((log, idx) => (
                  <div key={idx} className="console-log">
                    <span className="console-timestamp">[{idx + 1}]</span>
                    <span className="console-message">{log}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        )}

        {/* ERROR ALERT */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* PROMPT HISTORY */}
        {versions.length > 0 && (
          <div className="section">
            <h3 className="section-title">🧾 Prompt History</h3>
            <div className="prompt-list">
              {versions.map((version, index) => (
                <button
                  key={index}
                  className={`prompt-item ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => rollbackTo(index)}
                >
                  <div className="prompt-title">Version {index + 1}</div>
                  <div className="prompt-intent">{version.intent}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI EXPLANATION */}
        {currentVersion && (
          <div className="section">
            <div className="explanation">
              <h3 className="explanation-title">💡 AI Explanation</h3>
              <p className="explanation-text">
                {currentVersion.explanation}
              </p>
            </div>
          </div>
        )}

        {/* DIFF SUMMARY */}
        {currentVersion?.diff && (
          <div className="diff">
            <h4 className="diff-title">Changes</h4>

            {currentVersion.diff.added.length > 0 && (
              <div className="diff-added">
                + Added: {currentVersion.diff.added.join(", ")}
              </div>
            )}

            {currentVersion.diff.removed.length > 0 && (
              <div className="diff-removed">
                - Removed: {currentVersion.diff.removed.join(", ")}
              </div>
            )}

            {currentVersion.diff.added.length === 0 &&
              currentVersion.diff.removed.length === 0 && (
                <div className="diff-none">No structural changes</div>
              )}
          </div>
        )}

      </div>

      {/* MIDDLE PANEL - JSON CODE */}
      <div className="panel code-panel">
        <h2>📄 Generated Code (JSON)</h2>
        <textarea
          className="code-textarea"
          value={currentVersion?.code || "// Your generated UI code will appear here..."}
          readOnly
          spellCheck={false}
        />
      </div>

      {/* RIGHT PANEL - LIVE PREVIEW */}
      <div className="panel preview-panel">
        <h2>👁️ Live Preview</h2>
        {currentVersion ? (
          <PreviewRenderer tree={currentVersion.plan} />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 120px)',
            color: '#9ca3af',
            fontSize: '16px',
            textAlign: 'center',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '48px' }}>🎨</div>
            <div>Your UI preview will appear here</div>
            <div style={{ fontSize: '14px', color: '#d1d5db' }}>
              Start by describing your UI in the chat panel
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
