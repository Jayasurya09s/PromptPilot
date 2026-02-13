# PromptPilot

PromptPilot is an AI-powered UI generator that turns natural language into validated UI trees, live previews, and clear explanations. It combines a deterministic component system, multi-agent reasoning, security checks, and version history so outputs are safe, reproducible, and easy to refine.

This repository contains the Next.js app in `ai-ui-generator/`.

## Overview

PromptPilot separates planning, generation, validation, and explanation into explicit agents. This keeps UI output deterministic while still benefiting from LLM reasoning, and adds guardrails that prevent unsafe or invalid output.

The product experience is a three-panel workspace (chat + history, JSON view, live preview) with a landing screen for auth and usage context. Generation uses a streaming API to provide step-by-step progress and live logs, and every successful run becomes a versioned session entry that can be rolled back.

## Design Philosophy

PromptPilot prioritizes determinism over creativity.

Rather than allowing the LLM to generate arbitrary JSX, the system constrains generation to a fixed component registry and enforces strict validation before rendering.

This ensures:
- Reproducible outputs
- Visual consistency
- Debuggability
- Safety against prompt injection
- Controlled iteration

The architecture intentionally separates reasoning (Planner) from deterministic construction (Generator) to avoid trusting the LLM with direct UI execution.

## Why Not a Single LLM Call?

A single-call approach would directly generate JSX or JSON and render it.

This was intentionally avoided because:

- It reduces determinism
- It makes validation harder
- It increases injection risk
- It blurs reasoning vs execution

Instead, PromptPilot splits:
- Planning (semantic reasoning)
- Generation (deterministic building)
- Validation (schema enforcement)
- Explanation (transparency)

This improves reliability and makes the system debuggable.

## Highlights

- Multi-agent pipeline: planner -> generator -> validator -> explainer
- Deterministic component registry with strict prop validation (Zod)
- Prompt injection guardrails that block unsafe requests before planning
- JWT auth with MongoDB-backed sessions and history for repeatable runs
- Daily credits with UTC reset to simulate realistic usage boundaries
- Real-time generation logs streamed to the UI for transparency
- Model fallback with OpenRouter, with optional key fallback for new users
- Versioning with structural diffs and rollback for safe iteration
- Live preview renderer that maps UI trees to registered React components
- JSON code view for each generated version

## Architecture

```
User Intent
	-> Security Filter (Prompt Injection Guard)
	-> Planner Agent (Intent -> Structured Plan)
	-> Generator Agent (Plan -> Deterministic UI Tree)
	-> Validator (Schema + Depth + Prop Enforcement)
	-> Explainer Agent (Reasoning Transparency)
	-> Version Manager (History + Rollback)
	-> Renderer (Live Preview)
```

Streaming updates (progress + logs) are emitted during the pipeline so the UI can display what is happening at each step.

## Agent Responsibilities

### Planner Agent

- Interprets user intent and creates a structured plan
- Determines layout strategy and component hierarchy
- Mode: create or modify
- Emits strict JSON only (no markdown) to ensure parsing safety
- Includes constraints such as max depth (currently 5) and allowed components
- Model fallback:
	- Primary: openrouter/free
	- Fallback: meta-llama/llama-3.2-3b-instruct:free

### Generator Agent

- Converts the plan into a deterministic UI tree
- Enforces the fixed component registry
- Applies schema guarantees via Zod validation
- Fails fast with detailed validation errors if props or structure are invalid

### Validator

Validates:
- Only whitelisted components
- Props match Zod schemas
- Max depth not exceeded
- Children structure integrity
- Node shape must be a valid object with a known component type

### Explainer Agent

- Generates a clear, concise explanation of the UI tree
- Uses the same model fallback strategy as the planner
- Low temperature for more consistent explanations

## Deterministic Component System

All UI is built using a fixed component registry:

| Component | Purpose | Props |
| --- | --- | --- |
| Button | Interactive button | label (required), variant?: "primary" \| "secondary" |
| Card | Content container | title?: string |
| Input | Text input field | placeholder?: string |
| Navbar | Top navigation | title?: string |
| Sidebar | Left navigation | children only |
| Modal | Dialog box | title?: string |
| Table | Tabular data | headers: string[], rows: string[][] |
| Chart | Data visualization | title?: string |

The AI cannot:
- Create new components
- Use arbitrary HTML tags
- Inject custom CSS or inline styles

Preview rendering is a pure lookup: each node type must exist in the component registry, or the renderer displays an invalid-component warning instead of executing unknown UI.

## Safety and Validation

- Prompt injection scanning blocks unsafe or malicious inputs
- Prop-level validation via Zod schemas
- Depth limit enforcement prevents recursive explosion
- Deterministic rendering only occurs after passing all validation steps
- Security scanning checks for attempts to override system prompts or inject HTML/CSS

## Edit Awareness and Versioning

- Incremental modifications with diffs between versions
- Rollback to any prior version
- Regenerate using the latest models
- Each session stores intent, plan, UI tree, explanation, and structural diff

## Real-Time Generation Logs

Generation steps and model fallback logs stream live to the UI during processing.

The API streams structured events (progress, logs, errors, done) so the UI can render a live console and step timings.

## Model Fallback Strategy

Planner and explainer fallback chain:
1) openrouter/free
2) meta-llama/llama-3.2-3b-instruct:free

If the primary model is rate limited, the system falls back gracefully.

New users can be routed through a secondary and backup API key chain to make the free-tier experience more reliable.

## Session & Credit Design

Authentication and daily credits were added to simulate real-world usage constraints and to test rate-limit resilience under free-tier LLM APIs.

Credits reset daily at 00:00 UTC to enforce predictable usage boundaries.

Sessions are stored per user in MongoDB, and JWT tokens are used for API access. Passwords are hashed with bcrypt, and tokens expire after 7 days.

Credits are managed on login and before generation requests, ensuring usage limits are enforced consistently.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript 5
- MongoDB + Mongoose
- OpenRouter (LLM access)
- Zod schemas for props and validation
- Tailwind-based UI styles (custom CSS in styles/ui.css)
- SSE-style streaming responses for progress and logs

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- OpenRouter API key

### Install

```bash
cd ai-ui-generator
npm install
```

### Environment Variables

Create `ai-ui-generator/.env.local`:

```
OPENROUTER_API_KEY=your_primary_key
OPENROUTER_API_KEY_SECONDARY=your_secondary_key
OPENROUTER_API_KEY_BACKUP=your_backup_key
GEMINI_API_KEY=optional_gemini_key
MONGODB_URI=mongodb://127.0.0.1:27017/promptpilot
JWT_SECRET=your_strong_random_secret
DAILY_CREDITS=4
```

Notes:
- Secondary/backup OpenRouter keys are used only for new users and only on rate-limit errors.
- Credits reset at 00:00 UTC.

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

- POST /api/agent - generates UI, streams logs and progress
- POST /api/auth/login - JWT login
- POST /api/auth/register - JWT register
- GET /api/sessions - fetch session history

## Frontend Experience

- Three-panel workspace: prompt history + chat, JSON output, and live preview
- Version history with rollback to any prior generation
- Regenerate action to refresh the latest version with the same intent
- Live console and progress timeline during generation
- Account panel showing daily credits and reset time
- Landing screen for onboarding with login/register modal

## Project Structure

```
ai-ui-generator/
	app/
		api/
			agent/route.ts
			auth/login/route.ts
			auth/register/route.ts
			sessions/route.ts
		layout.tsx
		page.tsx
	components/
		PreviewRenderer.tsx
		ui/
	lib/
		agents/
		auth.ts
		credits.ts
		openrouter.ts
		validator.ts
	models/
		Session.ts
		User.ts
	styles/
		ui.css
```

## Known Limits

- Free-tier model availability can be inconsistent
- Diffing is structural, not CSS/property-level
- Rate limits depend on OpenRouter tier
- Component styling is fixed to the registry components; no arbitrary styles

## Testing

- API-level generation tests validate base generation, edit awareness, nested modification, removal, and safety rejection

## Tradeoffs

- Free-tier LLM models can be inconsistent; fallback logic mitigates this but does not eliminate variability.
- Structural diffing operates at the component level, not deep prop-level mutation tracking.
- No persistent per-user UI customization beyond session storage.
- Streaming logs increase complexity but improve transparency.

## Future Improvements

- Deterministic planning using a fine-tuned local model
- Component-level diff visualization (tree highlighting)
- Static type analysis of generated trees
- Replayable generation sessions
- Real-time collaborative sessions
- Persisted streaming explanation traces

## License

MIT
