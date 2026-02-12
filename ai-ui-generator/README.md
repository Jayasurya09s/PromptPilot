# 🧠 AI UI Generator

**Deterministic Multi-Agent UI Generation System**

---

## 🚀 Overview

This project implements a deterministic AI-powered UI generator that converts natural language intent into structured React UI using a fixed component system.

Unlike single-LLM generation tools, this system separates reasoning, generation, validation, and explanation into explicit agent steps to ensure safety, reproducibility, and edit-awareness.

---

## 🎯 Core Capabilities

✅ **Deterministic component system** — Fixed registry prevents arbitrary component creation  
✅ **Multi-step agent orchestration** — Planner → Generator → Validator → Explainer  
✅ **Edit-aware modifications** — Tracks changes, diffs versions, enables rollback  
✅ **Explainability** — Human-readable reasoning for every generated UI  
✅ **Prompt injection protection** — Scans and rejects malicious inputs  
✅ **Component whitelist enforcement** — Only 8 pre-defined components allowed  
✅ **Prop-level validation** — Zod schemas ensure type correctness  
✅ **Model fallback robustness** — Graceful degradation under rate limits  
✅ **Version history & rollback** — Full tree snapshots with diff summaries  

---

## 🏗 Architecture

### Agent Pipeline

```
User Intent
    ↓
Security Filter (Prompt Injection Guard)
    ↓
Planner Agent (Intent → Structured Plan)
    ↓
Generator Agent (Plan → Deterministic UINode Tree)
    ↓
Validator (Schema + Depth + Prop Enforcement)
    ↓
Explainer Agent (Reasoning Transparency)
    ↓
Version Manager (History + Rollback)
    ↓
Renderer (Live Preview)
```

---

## 🧠 Agent Responsibilities

### 1️⃣ Planner Agent

**Purpose:** Interprets user intent and creates a structured plan

- Analyzes natural language description
- Determines layout strategy and component hierarchy
- Identifies modifications (when editing existing UIs)
- Outputs structured `Plan` object (not final UI tree)
- Mode: `create` or `modify`
- 2-tier model fallback:
  - Primary: `openrouter/free`
  - Fallback: `meta-llama/llama-3.2-3b-instruct:free`

**Why separate?**
Decouples reasoning from deterministic UI building. The planner can be creative in structure planning while the generator enforces strict rules during implementation.

---

### 2️⃣ Generator Agent

**Purpose:** Converts `Plan` object into deterministic `UINode` tree

- Recursive `ComponentSpec` → `UINode` conversion
- Applies schema guarantees via Zod validation
- Enforces fixed component registry
- Prevents arbitrary component creation
- Zero styling decisions (delegated to components)

**Why separate?**
Ensures reproducibility. Given the same plan, output is always identical. Decouples AI reasoning from structural determinism.

---

### 3️⃣ Validator

**Purpose:** Enforces all structural and prop constraints

Validates:
- ✅ Only whitelisted components used
- ✅ Props match Zod schemas exactly
- ✅ Maximum nesting depth not exceeded
- ✅ Children structure integrity (e.g., Button has no children)
- ✅ No inline styles attempted
- ✅ No arbitrary HTML tags

**Errors are detailed and actionable**

---

### 4️⃣ Explainer Agent

**Purpose:** Generates human-readable explanations of generated UIs

- Analyzes final UINode tree
- References layout decisions and component placement
- Explains hierarchy and grouping logic
- Enhances trust through transparency

---

## 🔒 Deterministic Component System

All UI is built using a **fixed component registry**:

| Component | Purpose | Props |
|-----------|---------|-------|
| **Button** | Interactive button | `label` (required), `variant?: "primary" \| "secondary"` |
| **Card** | Content container | `title?: string` |
| **Input** | Text input field | `placeholder?: string` |
| **Navbar** | Top navigation | `title?: string` |
| **Sidebar** | Left navigation | (children only) |
| **Modal** | Dialog box | `title?: string` |
| **Table** | Tabular data | `headers: string[]`, `rows: string[][]` |
| **Chart** | Data visualization | `title?: string` |

### What the AI Cannot Do:

❌ Create new components  
❌ Use arbitrary Tailwind classes  
❌ Inject custom CSS  
❌ Render HTML tags  
❌ Use inline styles  

This guarantees **visual consistency** and **reproducibility**.

---

## 🔁 Edit Awareness & Versioning

### Features:

- **Incremental modifications** — Only changed components regenerated
- **Minimal updates** — User intent drives selective tree changes
- **Tree diffs** — Computed differences between versions
- **Rollback** — Instant restoration to prior versions without API calls
- **Regenerate** — Re-run same intent against latest models

---

## 🛡 Safety & Validation

### Prompt Injection Protection

User input is scanned for:

- **Instruction overrides** — "Ignore previous instructions..."
- **HTML generation attempts** — `<script>`, `<div onclick=...>`
- **System prompt manipulation** — "You are now..."
- **External styling requests** — "Use inline styles..."

Malicious prompts are **rejected before reaching the LLM**.

### Prop-Level Validation

Each component enforces strict Zod schemas. Invalid props are rejected with detailed error messages.

### Depth Limit Enforcement

Prevents recursive explosion, infinite nesting, and resource abuse.

**Limit:** maxDepth = 5

---

## 🔄 Model Fallback Strategy

### Planner Fallback Chain:
1. `openrouter/free` (primary)
2. `meta-llama/llama-3.2-3b-instruct:free` (fallback)

### Explainer Fallback Chain:
1. `openrouter/free` (primary)
2. `meta-llama/llama-3.2-3b-instruct:free` (fallback)

Gracefully handles 402/429 rate limit errors with automatic model rotation.

---

## 🖥 Key Features

### 1. Live UI Preview
- Real-time rendering with professional Tailwind CSS styling
- Responsive layout with gradients and shadows
- Error states with visual feedback

### 2. Code Viewer
- Formatted JSON display of generated tree
- Dark editor theme with syntax highlighting

### 3. Regenerate Button
- Re-run same user intent with fresh models
- Useful when hitting rate limits

### 4. Version History Panel
- Snapshot-based history
- Quick access to any prior version
- Change summaries (added/removed/modified counts)

### 5. Tree Diff Summary
- Component-level change tracking
- Visual representation of modifications

### 6. Structured Explanation
- AI-generated reasoning for layout decisions
- References component placement and hierarchy

### 7. Error Panel
- Clear validation error messages
- Rate limit and API error handling

### 8. Security Layer
- Prompt injection scanning
- Component whitelist enforcement
- Recursive depth protection

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | App Router, Server Components |
| **TypeScript 5** | Strict type safety |
| **React 19** | Client-side state |
| **Tailwind CSS 4** | Professional styling |
| **Zod 4.3.6** | Schema validation |
| **OpenRouter API** | Multi-model LLM access |
| **tsx 4.21.0** | Integration tests |

---

## 📊 Validated Behavior

### ✅ Tested Scenarios

| Phase | Scenario | Status |
|-------|----------|--------|
| Cold Boot | Initial server startup | ✅ Pass |
| Base Generation | Simple dashboard creation | ✅ Pass |
| Complex Layout | Multi-section UI with 5+ components | ✅ Pass |
| Nested Components | 4-level deep nesting with validation | ✅ Pass |
| Edge Cases | Special characters rejected (security) | ✅ Pass |
| Error Handling | Invalid structures rejected | ✅ Pass |
| Prop Validation | Zod schema enforcement | ✅ Pass |
| Model Fallback | Graceful degradation on rate limits | ✅ Pass |
| Production Build | Compiled 2.0s, all routes generated | ✅ Pass |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key

### Install

```bash
cd ai-ui-generator
npm install
```

### Environment Variables

Create `.env.local`:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## 📋 File Structure

```
ai-ui-generator/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main UI (3-panel layout)
│   └── api/agent/route.ts      # Agent orchestration API
├── components/
│   ├── PreviewRenderer.tsx      # Dynamic tree renderer
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       └── Chart.tsx
├── lib/
│   ├── types.ts                # Core types (UINode, etc)
│   ├── validator.ts            # Tree validation
│   ├── componentRegistry.ts    # Component registry
│   ├── propSchemas.ts          # Zod schemas
│   └── agents/
│       ├── planner.ts
│       ├── generator.ts
│       └── explainer.ts
├── styles/
│   └── ui.css
└── README.md
```

---

## 💡 Design Philosophy

This project prioritizes:

1. **Determinism over creativity** — Predictable, reproducible outputs
2. **Transparency over black-box** — Explicit agent steps, human-readable reasoning
3. **Explicit separation over monoliths** — Each agent has single responsibility
4. **Safety-first AI** — Prompt injection scanning, component whitelisting, depth limits
5. **Reproducible systems** — Same intent → consistent tree structure

---

## ⚙ Known Limitations

- Free-tier LLM variability
- Diff engine tracks component-level changes (not prop-level diffs)
- No streaming responses
- In-memory storage (no persistence)
- Single-user mode

---

## 🚀 Future Improvements

1. Streaming responses for real-time feedback
2. Database-backed version history
3. Visual diff highlighting
4. Per-component prop tracking
5. Unit test suite (100% coverage)
6. Multi-user support with quotas
7. Custom component registration
8. Export to React/HTML/Figma

---

## 📞 Support

For issues:

1. Check the error panel in-app (detailed validation messages)
2. Review terminal logs (agent steps logged)
3. Verify `.env.local` has valid OpenRouter API key
4. Test with simpler intents first

---

## 📄 License

MIT License — See LICENSE file for details

---

**Built By JAYANTH using AI-orchestrated components**

*Experience deterministic AI UI generation with transparency, safety, and reproducibility.*

