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

import { useState } from "react";
import PreviewRenderer from "@/components/PreviewRenderer";
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

  // Get currently selected version or null
  const currentVersion =
    currentIndex !== null ? versions[currentIndex] : null;

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

    setLoading(true);
    setError(null);
    setProgress([]);

    try {
      // Call AI agent API
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          previousTree: currentVersion?.plan || null,
        }),
      });

      const data = await res.json();

      // Display progress steps as they complete
      if (data.progress && Array.isArray(data.progress)) {
        data.progress.forEach((step: any) => {
          setTimeout(() => {
            setProgress(prev => [...prev, step]);
          }, step.timestamp || 0);
        });
      }

      // Handle API errors
      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Create new version entry
      const newVersion: Version = {
        plan: data.plan,
        code: JSON.stringify(data.plan, null, 2),
        explanation: data.explanation,
        intent,
        diff: data.diff,
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

  return (
    <div className="app-container">

      {/* LEFT PANEL - AI CHAT */}
      <div className="panel chat-panel">
        <h2>
          <span>🤖</span> AI Chat
        </h2>

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
            {progress.map((step, idx) => (
              <div key={idx} className="progress-step">
                <span className="step-emoji">{step.emoji}</span>
                <span className="step-status">{step.status}</span>
              </div>
            ))}
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

        {/* VERSION HISTORY */}
        {versions.length > 0 && (
          <div className="section">
            <h3 className="section-title">📚 Version History</h3>
            <div className="version-list">
              {versions.map((_, index) => (
                <button
                  key={index}
                  className={`version-btn ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => rollbackTo(index)}
                >
                  Version {index + 1}
                  {index === currentIndex && ' (Current)'}
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
