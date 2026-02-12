"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState<string>(`// Generated UI will appear here`);

  return (
    <div className="app-container">
      
      {/* LEFT PANEL - CHAT */}
      <div className="panel chat-panel">
        <h2>AI Chat</h2>
        <textarea
          style={{ width: "100%", height: "120px" }}
          placeholder="Describe your UI..."
        />
        <button style={{ marginTop: "10px" }}>Generate UI</button>
      </div>

      {/* MIDDLE PANEL - CODE */}
      <div className="panel code-panel">
        <h2>Generated Code</h2>
        <textarea
          style={{ width: "100%", height: "80%" }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      {/* RIGHT PANEL - PREVIEW */}
      <div className="panel preview-panel">
        <h2>Live Preview</h2>
        <div style={{ padding: "10px", border: "1px solid #e5e7eb" }}>
          Preview will render here
        </div>
      </div>

    </div>
  );
}
