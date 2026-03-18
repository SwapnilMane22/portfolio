# Portfolio Architecture & Documentation

This repository houses a modern, dynamic, and responsive personal developer portfolio. It is divided into two primary subsystems: a powerful React-based frontend and a Node.js/Express backend that fuels the data layer and AI chatbot integrations.

## 💻 Local Development & Setup

Follow these steps to run the portfolio on your local machine (macOS, Linux, or Windows/WSL):

### 1) Prerequisites
- **Node.js**: v18+ recommended
- **npm**: (comes bundled with Node)
- **Git**

### 2) Install Dependencies
From the root `portfolio/` folder, install packages for both the backend and frontend:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3) Configure Backend Environment (Optional)
If you wish to enable the integrated AI chatbot, create a `.env` file inside the `backend/` directory:
```bash
# Provide an API key for the chatbot inference models
OPENROUTER_API_KEY=your_key_here
# or
GEMINI_API_KEY=your_key_here
PORT=5000
```
> Note: If no API keys are provided, the site will still render perfectly, but the Chatbot will gracefully inform users that it is offline.

### 4) Run the Servers
Open two terminal windows. 

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend React App):**
```bash
cd frontend
npm start
```
The application will automatically launch in your browser at `http://localhost:3000`.

## 🏗️ System Design: Frontend & Backend Communication

The architecture is built on a decoupled Client-Server model, operating as follows:

1. **The Backend API**: The Express server acts as the central data provider. It runs a REST API on `http://localhost:5000` exposing endpoints like `/api/profile` and `/api/chat`.
2. **The Frontend Client**: The React frontend (bootstrapped with Create React App) runs independently. When the React app mounts, it makes asynchronous HTTP `GET` fetching calls to the backend's `/api/profile` endpoint.
3. **Dynamic State Rendering**: The frontend receives the JSON payload from the API, passes the data into local React State (`useState` / Context Providers), and dynamically renders the entire UI based strictly on the backend's payload. The frontend does not hardcode personal information; it simply acts as a presentation layer for the data it fetches.

---

## 💾 The JSON "Database"

To prioritize speed, simplicity, and portability, this portfolio bypasses traditional heavy databases (like PostgreSQL or MongoDB) in favor of a **Local JSON File Database** model. 

- **Source of Truth**: All dynamic text, experience metrics, project descriptions, and links are stored inside `backend/data/knowledge.json`.
- **How it Works**: When the frontend requests data via `/api/profile`, the Express backend uses the native Node `fs` (File System) module to read, parse, and serve the `knowledge.json` file.
- **Why?**: This allows the owner to instantly update their entire portfolio (e.g., adding a new job or fixing a typo) simply by editing a single text file, requiring absolutely zero database migrations, SQL queries, or complex setup.

---

## 🧠 RAG Pipeline & Semantic Routing Guardrails

The integrated AI chatbot uses a custom **Retrieval-Augmented Generation (RAG)** pipeline to answer questions reliably based *only* on the portfolio's context.

### 1) Dynamic Context Construction
When a user submits a query via the `/api/chat` or `/api/chat/stream` endpoints, the backend dynamically reads `data/knowledge.json`. It flattens the nested JSON structures (Skills, Experience, Projects, Education) and compiles them into a hard-coded system prompt. This ensures the LLM generates answers strictly using the factual data provided in the portfolio without hallucinating external information.

### 2) The LLM Semantic Router (Cost & Token Optimization)
Passing the entire `knowledge.json` context array to the LLM for every single message consumes significant input tokens. To mitigate against off-topic queries and prompt injections, the system uses an advanced **Semantic Router**:
- **Zero-Context Pre-Flight Check**: Before processing the primary RAG request, the user's query is intercepted and sent to a fast, lightweight LLM model with a tiny zero-context prompt (using `<40 tokens` total).
- **Intent Classification**: The router strictly forces the LLM to classify the categorical string as internal `PORTFOLIO` queries, direct `CONTACT` requests, or `OTHER` generic tech questions.
- **Early Return**: If the query is classified as `CONTACT` (e.g., "how can I hire you") or `OTHER` (e.g., "write some python code"), the backend immediately returns a customized template response mapped from `data/guardrails.json` and cleanly drops the request. The primary expensive LLM call is bypassed completely.

### 3) Zero-Latency Regex Fallback
For maximum security, the backend implements a secondary fast-path. Before even hitting the Semantic Router, all incoming queries are tested against a suite of offline Regular Expressions nested natively in `guardrails.json`. If a known toxic or off-topic pattern is detected, it returns instantly with 0ms latency and 0 LLM tokens burned.

---

## 🚀 CI/CD Pipeline Operations

The repository utilizes **GitHub Actions** to guarantee reliable, automated Continuous Integration and Continuous Deployment (CI/CD). 

The pipeline (`.github/workflows/deploy.yml`) actively listens for code changes:
1. **Trigger**: Pushing any code to the `main` branch automatically triggers the workflow runner.
2. **Build**: A fresh `ubuntu-latest` virtual machine is provisioned. It checks out the code, installs Node.js v18, and runs `npm install` and `npm run build` on the `frontend/` directory to compile an optimized, minified production package.
3. **Deploy**: Once safely built, the `JamesIves/github-pages-deploy-action` kicks in. It takes the newly compiled `build/` folder and actively force-pushes it onto a separate branch called `gh-pages`.
4. **Host**: GitHub Pages intercepts the `gh-pages` branch and instantly serves the React static files globally to the live portfolio web URL without any manual FTP or server administration.

---

## ⚙️ Tech Stack

**Frontend Framework & Tooling**
*   **React (v18)** - Core UI framework managing layouts and view lifecycles.
*   **Framer Motion** - High-performance animation engine for backgrounds, scroll reveals, and gesture mapping.
*   **Context API** - Native React state management for Theme (Dark/Light), Chatbot persistence, and Profile Data.
*   **Material UI (MUI) / CoreUI Icons** - Clean, scalable SVG icon components handling interactive UI elements.
*   **React Markdown** - Translates LLM markdown responses into safe HTML for the chatbot interface.

**Backend & AI**
*   **Node.js & Express** - Lightweight server providing REST and Server-Sent Event (SSE) streaming capabilities.
*   **OpenRouter / Google AI Studio** - Cloud LLM inference APIs powering the integrated RAG chatbot.
*   **dotenv / CORS** - Vital Node middleware for environment secrets and cross-origin security execution.

---

## 🎨 Design Principles Implemented

*   **Glassmorphism Themeing**: The UI relies heavily on modern glass overlays (`backdrop-filter: blur`), opaque tinting, and precise soft drop-shadows to provide a crystal-clear, deep, futuristic aesthetic overlapping the live background elements.
*   **Responsive Mobile-First Scaling**: All structural containers utilize fluid CSS Flexbox mapping and CSS variables (e.g., `gap`, `flex-wrap: wrap`) over strict pixel dimensions, allowing interactive elements to seamlessly wrap and shift to accommodate narrow phone viewports.
*   **Dynamic Backgrounds & Interactivity**: Static backgrounds cause visual fatigue. We implemented an ambient system of moving background blobs fueled by dynamic, randomized keyframes that also gently track cursor positioning to make the DOM feel alive.
*   **Dynamic Island Navigation**: Utilizing progressive scroll-tracking, the primary semantic navigation dynamically shifts from a transparent fixed position into a hyper-condensed floating "island" when scrolling deeply into the site to capture user attention and preserve screen real-estate.
*   **Accessible Readability Constraints**: Background tracking and blur properties strictly decouple background noise from foreground text layouts, ensuring high contrast. We utilize carefully tuned contrast ratios depending on semantic classes triggered by the global `.light` or `.dark` body modifiers.

---

## 🔮 Future Improvements & Roadmap

While the application operates fluidly, the following architecture optimizations and feature developments are actively being considered:

*   **Monorepo Migration (Turborepo)**: Combine the uncoupled Native React Frontend and Express Node Backend into a unified full-stack monorepo framework (e.g. Next.js App Router) for optimized shared typing, streamlined single-command CI pipelines, and faster edge deployments.
*   **WebGL Background Shaders**: Replace the current DOM-based framer-motion blob rendering with a low-level Three.js or WebGL shader. Offloading background animation calculations from the CPU to the GPU would dramatically increase framerates and lower battery drain on mobile devices while allowing for much more complex ambient effects.
*   **State Persistent Chatbot Memory**: Integrate a lightweight edge database (like Redis or SQLite) into the backend server to temporarily cache chat histories by session ID. This would allow the chatbot to "remember" earlier contextual conversations dynamically instead of relying purely on a hardcoded loop back from the frontend React state.
*   **Headless CMS Integration**: Migrate the static local `knowledge.json` data store into a headless markdown CMS system (like Sanity or Strapi). This enables non-technical editing through a GUI dashboard rather than forcing raw JSON edits when updating resume bullets.