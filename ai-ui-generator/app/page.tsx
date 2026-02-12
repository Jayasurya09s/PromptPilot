"use client";

import { useState } from "react";
import PreviewRenderer from "@/components/PreviewRenderer";
import { UINode } from "@/lib/types";

type Version = {
  plan: UINode;
  code: string;
  explanation: string;
};

export default function Home() {
  const [intent, setIntent] = useState<string>("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const currentVersion =
    currentIndex !== null ? versions[currentIndex] : null;

  const generateUI = async () => {
    if (!intent.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          previousTree: currentVersion?.plan || null,
        }),

      });

      const data = await res.json();

      if (data.success) {
        const newVersion: Version = {
          plan: data.plan,
          code: JSON.stringify(data.plan, null, 2),
          explanation: data.explanation,
        };

        setVersions((prev) => {
          const updated = [...prev, newVersion];
          setCurrentIndex(updated.length - 1);
          return updated;
        });

      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  const rollbackTo = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="app-container">

      {/* LEFT PANEL */}
      <div className="panel chat-panel">
        <h2>AI Chat</h2>

        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          style={{ width: "100%", height: "120px" }}
          placeholder="Describe your UI..."
        />

        <button
          style={{ marginTop: "10px" }}
          onClick={generateUI}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate UI"}
        </button>

        {/* Version History */}
        {versions.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Versions</h3>
            {versions.map((_, index) => (
              <button
                key={index}
                style={{
                  display: "block",
                  marginTop: "5px",
                  background:
                    index === currentIndex ? "#2563eb" : "#e5e7eb",
                  color: index === currentIndex ? "white" : "black",
                }}
                onClick={() => rollbackTo(index)}
              >
                Version {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Explanation */}
        {currentVersion && (
          <div style={{ marginTop: "20px" }}>
            <h3>AI Explanation</h3>
            <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
              {currentVersion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* MIDDLE PANEL */}
      <div className="panel code-panel">
        <h2>Generated Code (JSON)</h2>

        <textarea
          style={{ width: "100%", height: "85%" }}
          value={currentVersion?.code || ""}
          readOnly
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="panel preview-panel">
        <h2>Live Preview</h2>
        <PreviewRenderer tree={currentVersion?.plan || null} />
      </div>

    </div>
  );
}
