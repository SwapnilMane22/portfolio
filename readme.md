# Portfolio — Architecture & Setup

Personal developer portfolio for Swapnil Mane. Two subsystems:

- **`frontend/`** — React 18 SPA (Create React App) served from GitHub Pages
- **`backend/`** — Node.js/Express API served as a Vercel serverless function

The frontend renders from `/api/profile`; the integrated chatbot streams from `/api/chat/stream` (RAG over `backend/data/knowledge.json`).

---

## Local development

### Prerequisites
- Node.js 18+
- npm
- Git

### Install
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Backend env (`backend/.env`)
The chatbot tries providers in this order: **NVIDIA NIM → Google AI Studio → OpenRouter**. Any one provider is enough.

```bash
# Primary provider (recommended)
NVIDIA_API_KEY=nvapi-xxxxxxxx
NVIDIA_MODELS=nvidia/llama-3.3-nemotron-super-49b-v1,meta/llama-3.3-70b-instruct,meta/llama-3.1-8b-instruct
NVIDIA_ROUTER_MODEL=meta/llama-3.1-8b-instruct

# Fallback #1
GEMINI_API_KEY=xxxxxxxx
GEMINI_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
GEMINI_ROUTER_MODEL=gemini-2.5-flash-lite

# Fallback #2
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
CHAT_MODELS=meta/llama-3.3-70b-instruct:free,google/gemma-3-27b-it:free
ROUTER_MODEL=google/gemma-2-9b-it:free

# Abuse protection
ALLOWED_ORIGINS=http://localhost:3000,https://swapnilmane22.github.io
CHAT_RATE_PER_MIN=10
CHAT_RATE_PER_DAY=100

# Optional: CONTACT intent webhook (Slack/Discord) so you get notified
CONTACT_WEBHOOK_URL=

PORT=5000
```
If no provider keys are set, the site still renders; the chatbot returns a friendly "unavailable" message.

### Run
Two terminals:

```bash
# 1. Backend API on :5000
cd backend && npm start

# 2. Frontend on :3000
cd frontend && npm start
```
Open <http://localhost:3000>.

---

## Architecture

**Client–server split.** The React app fetches `/api/profile` on mount and renders the UI from the response — no hardcoded personal data on the frontend. The chatbot opens an SSE stream to `/api/chat/stream`.

**JSON as source of truth.** All resume data lives in `backend/data/knowledge.json`. The Express backend reads it with `fs`, assembles `/api/profile`, and also compiles it into the RAG system prompt. Updating the portfolio is a single-file edit — no database.

```
┌─────────────┐  GET /api/profile      ┌─────────────────┐  reads  ┌──────────────────┐
│  React UI   │ ─────────────────────▶ │  Express API    │ ──────▶ │  knowledge.json  │
│  (GH Pages) │                        │  (Vercel λ)     │         └──────────────────┘
│             │  POST /api/chat/stream │                 │  ┌────────────────────────┐
│             │ ─────────────────────▶ │  SSE streaming  │◀─┤  NVIDIA / Gemini / OR  │
└─────────────┘                        └─────────────────┘  └────────────────────────┘
```

---

## RAG chatbot

**Context construction.** On boot, the backend flattens `knowledge.json` (skills, experience, projects, education, certifications, leadership, achievements, contact) into a single system prompt with strict anti-hallucination rules. The model is told to answer only from this context and to refuse anything that isn't a portfolio question.

**Two-stage intent router.** To avoid paying tokens on off-topic / injection queries:

1. **Regex fast path (0 ms, 0 tokens).** `data/guardrails.json` has compiled patterns for obvious CONTACT ("hire you", "schedule a call") and OTHER ("write me code", "ignore previous instructions", "reveal system prompt", "jailbreak", …) intents. A match returns the pre-canned template immediately.
2. **Semantic router fallback.** If regex misses, a tiny LLM call (~8 tokens out, `temperature: 0`) classifies the query as `PORTFOLIO | CONTACT | OTHER`. Anything other than PORTFOLIO is short-circuited before the full RAG call.

**Structural prompt-injection defense.** User input is wrapped in `<<<USER_INPUT>>> … <<<END_USER_INPUT>>>` delimiters and the system prompt instructs the model to treat everything inside the delimiters as untrusted data. Not a silver bullet, but meaningfully reduces "ignore previous instructions"–style attacks.

**Provider fallback.** The main chat call tries each configured provider in order and each model within that provider's list. Native SSE streaming where the provider supports it; token-chunk fallback otherwise.

---

## Security hardening (backend)

| Layer | Protection |
|---|---|
| **CORS** | Origin allowlist via `ALLOWED_ORIGINS`; unknown origins get a clean `403`. |
| **Helmet** | Standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, etc.). |
| **Rate limits** | Per-IP: `10 req/min` + `100 req/day` on chat endpoints. In-memory (per Vercel instance); swap to Redis for durable limits. |
| **Body size** | `express.json({ limit: '16kb' })`. |
| **Input caps** | `MAX_MESSAGE_CHARS=1000`, `MAX_HISTORY_ITEMS=10`, `MAX_HISTORY_ITEM_CHARS=2000`. |
| **History validation** | Role whitelist (`user \| assistant`) + length trim — defeats history-poisoning attacks. |
| **LLM timeouts** | All outbound calls wrapped in `AbortController` (default 15 s, router 6 s). |
| **SSE heartbeats** | `: ping` every 15 s + `X-Accel-Buffering: no` — keeps streams alive through proxies. |
| **Request IDs** | Every request gets an 8-char ID, surfaced in all `console.error` output for log correlation. |

---

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) deploys the frontend:

1. Push to `main` triggers the workflow.
2. A fresh `ubuntu-latest` runner installs Node 18, runs `npm ci && npm run build` in `frontend/`.
3. `JamesIves/github-pages-deploy-action` pushes the build to the `gh-pages` branch.
4. GitHub Pages serves the `gh-pages` branch at the live URL.

The backend deploys separately to Vercel (`vercel.json` rewrites every request to the Express app exported from `backend/api/index.js`).

---

## Tech stack

**Frontend**
- React 18, React Router
- Framer Motion (animations)
- MUI + CoreUI icons
- React Markdown + remark-gfm (chatbot rendering)
- Context API (theme, profile data, chatbot open state)

**Backend**
- Node.js 18 + Express 4
- `helmet`, `express-rate-limit`, `cors`, `dotenv`
- Native `fetch` + `AbortController` for LLM calls
- Server-Sent Events for chat streaming

**LLM providers**
- NVIDIA NIM (primary)
- Google AI Studio / Gemini (fallback)
- OpenRouter (final fallback)

---

## Design principles

- **Glassmorphism** — `backdrop-filter: blur` overlays, soft tinting, subtle shadows.
- **Mobile-first responsive** — CSS flex + variables; containers wrap rather than relying on fixed pixels.
- **Animated background** — Framer Motion blobs that drift and subtly track the cursor.
- **Dynamic island nav** — navbar collapses into a floating pill on scroll.
- **Theme-aware contrast** — `.light` / `.dark` body modifiers with tuned contrast ratios.

---

## Roadmap

- **Durable rate limits** — swap the in-memory `express-rate-limit` store for Upstash Redis so limits survive Vercel cold starts.
- **Real retrieval** — once `knowledge.json` grows past ~50 KB, move from "stuff everything into the system prompt" to embedding + top-k retrieval.
- **Monorepo (Turborepo / Next.js)** — collapse the split frontend/backend into one deploy surface.
- **Persistent chat memory** — session-scoped conversation history in Redis instead of client-stored history.
- **Headless CMS** — move resume data out of `knowledge.json` into a CMS (Sanity/Strapi) for non-technical editing.
- **WebGL background** — replace Framer Motion blobs with a Three.js shader.
