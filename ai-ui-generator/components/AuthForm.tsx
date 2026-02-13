import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "register";
  loading: boolean;
  error: string | null;
  onSubmit: (email: string, password: string, name?: string) => void;
  onToggleMode: () => void;
}

export default function AuthForm({
  mode,
  loading,
  error,
  onSubmit,
  onToggleMode,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      onSubmit(email, password);
    } else {
      onSubmit(email, password, name);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {mode === "register" && (
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: "8px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            width: "100%",
            padding: "8px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "#e2e8f0",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          required
          style={{
            width: "100%",
            padding: "8px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "#e2e8f0",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      {error && (
        <div style={{ color: "#fca5a5", fontSize: "12px", marginBottom: "12px" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          marginBottom: "12px",
        }}
      >
        {loading ? "Loading..." : mode === "login" ? "Login" : "Create Account"}
      </button>

      <button
        type="button"
        onClick={onToggleMode}
        style={{
          width: "100%",
          padding: "8px",
          background: "transparent",
          color: "#93c5fd",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        {mode === "login"
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </button>
    </form>
  );
}
