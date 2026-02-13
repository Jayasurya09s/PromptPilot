# PromptPilot

PromptPilot is an AI-powered UI generator that turns natural language into validated UI trees, live previews, and clear explanations. It combines a deterministic component system, multi-agent reasoning, security checks, and version history so outputs are safe, reproducible, and easy to refine.

This repository contains the Next.js app in `ai-ui-generator/`.

## Overview

PromptPilot separates planning, generation, validation, and explanation into explicit agents. This keeps UI output deterministic while still benefiting from LLM reasoning, and adds guardrails that prevent unsafe or invalid output.

## Highlights

- Multi-agent pipeline: planner -> generator -> validator -> explainer
- Deterministic component registry with strict prop validation (Zod)
- Prompt injection guardrails
- JWT auth with MongoDB-backed sessions and history
- Daily credits with UTC reset
- Real-time generation logs streamed to the UI
- Model fallback with OpenRouter, with optional key fallback for new users

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

## Agent Responsibilities

### Planner Agent

- Interprets user intent and creates a structured plan
- Determines layout strategy and component hierarchy
- Mode: create or modify
- Model fallback:
	- Primary: openrouter/free
	- Fallback: meta-llama/llama-3.2-3b-instruct:free

### Generator Agent

- Converts the plan into a deterministic UI tree
- Enforces the fixed component registry
- Applies schema guarantees via Zod validation

### Validator

Validates:
- Only whitelisted components
- Props match Zod schemas
- Max depth not exceeded
- Children structure integrity

### Explainer Agent

- Generates a clear, concise explanation of the UI tree
- Uses the same model fallback strategy as the planner

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

## Safety and Validation

- Prompt injection scanning blocks unsafe or malicious inputs
- Prop-level validation via Zod schemas
- Depth limit enforcement prevents recursive explosion

## Edit Awareness and Versioning

- Incremental modifications with diffs between versions
- Rollback to any prior version
- Regenerate using the latest models

## Real-Time Generation Logs

Generation steps and model fallback logs stream live to the UI during processing.

## Model Fallback Strategy

Planner and explainer fallback chain:
1) openrouter/free
2) meta-llama/llama-3.2-3b-instruct:free

If the primary model is rate limited, the system falls back gracefully.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript 5
- MongoDB + Mongoose
- OpenRouter (LLM access)
- Zod schemas for props and validation
- Tailwind-based UI styles (custom CSS in styles/ui.css)

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

## License

MIT
