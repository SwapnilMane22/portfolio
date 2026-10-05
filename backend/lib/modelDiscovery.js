/**
 * Live model discovery — ask each provider what it has, then prove it by calling.
 *
 * Every model name in this backend was a hardcoded default, and the important
 * ones are dead:
 *
 *   NVIDIA      'meta/llama-3.1-8b-instruct'   not in the 81-model catalogue
 *                                              this account sees, at all
 *   OpenRouter  'google/gemma-2-9b-it:free'    gone from the free catalogue
 *   Gemini      'gemini-2.5-flash'             still alive
 *
 * Those two defaults appeared in five places (the semantic router and the
 * JSON and SSE chat handlers each resolved their own copy), so the chatbot's
 * first-choice provider failed on every request and limped along on Gemini.
 * A hardcoded model name is a dated assertion about someone else's product: it
 * decays silently, and the first symptom is a dead feature.
 *
 * ── Discovery alone is NOT enough ────────────────────────────────────────
 *
 * The obvious fix — read `GET /models` and take the best — does not work.
 * Probing NVIDIA's catalogue with this account's key found six callable models
 * out of the plausible chat candidates:
 *
 *   200  moonshotai/kimi-k3, z-ai/glm-5.3, z-ai/glm-5.3-flash,
 *        openai/gpt-oss-20b, nvidia/nemotron-3-super-120b-a12b,
 *        nvidia/nemotron-3-ultra-550b-a55b
 *   404  kimi-k2.6, gemma-3-12b-it, nemotron-nano-3-30b-a3b,
 *        nemotron-4-340b-instruct, llama-3.1-nemotron-ultra-253b-v1,
 *        mistral-large-2-instruct, phi-3.5-moe-instruct, jamba-1.5-large-instruct
 *
 * The 404s say "Not found for account", and an NVIDIA model object carries only
 * `id`, `object`, `created` and `owned_by` — nothing that distinguishes the six
 * that work from the eight that do not. So the catalogue proposes; only the call
 * proves. The same holds on OpenRouter for a different reason: this key has
 * never purchased credits, so priced models return 402, and `pricing` is the
 * filter rather than a guarantee.
 *
 * Gemini is the exception that is actually well instrumented — it publishes
 * `supportedGenerationMethods`, which is real capability data, and self-updating
 * `-latest` aliases, which are the one kind of model name that does not decay.
 * Those are preferred for exactly that reason.
 *
 * ── So: propose, prove, remember ─────────────────────────────────────────
 *
 * `resolveModelList(provider)` returns ranked candidates — the operator's
 * configured list, plus the live catalogue, plus the measured seeds below,
 * deduplicated and ordered. The CALLER keeps its existing per-model loop and
 * reports what happened through `noteModelOutcome`, so a model that 404s drops
 * to the back and a model that worked moves to the front.
 *
 * On Vercel this cache is per warm instance, which is the right granularity: a
 * cold start pays one ~100ms catalogue fetch (measured: NVIDIA 7.7KB/90ms,
 * OpenRouter 765KB/130ms, Gemini 50 models) and every warm request reuses it.
 * Everything fails soft — an unreachable catalogue falls back to the configured
 * list and then to the seeds, so a provider behaves exactly as it did before.
 *
 * Measurements were taken 2026-10-02 against this project's own keys. They seed
 * the ranking; they are not a hard allowlist, because the entire point of this
 * module is that such a list goes stale.
 */

/** How long a fetched catalogue is reused. */
const DISCOVERY_TTL_MS =
  Number.parseInt(process.env.MODEL_DISCOVERY_TTL_MS || '', 10) || 6 * 60 * 60 * 1000;

/**
 * How long a model that answered 404/410 is skipped.
 *
 * Not forever: entitlements change when an account is upgraded. Not briefly
 * either, because re-probing a dead model costs a whole round trip on the
 * critical path of a user-visible chat reply.
 */
const DEAD_TTL_MS = Number.parseInt(process.env.MODEL_DEAD_TTL_MS || '', 10) || 6 * 60 * 60 * 1000;

/** How long a model that failed transiently (429, 5xx) is deprioritised. */
const COOLDOWN_MS = 10 * 60 * 1000;

/**
 * How long a model that TIMED OUT is deprioritised — longer than a generic blip.
 *
 * A timeout is evidence about that model's serving latency rather than a passing
 * error, and measurement shows the latency is not something a caller can tune
 * away: `z-ai/glm-5.3-flash` answered the router prompt in 13.5s at
 * max_tokens=64 but 3.0s at 128, so the budget does not predict it. Left on the
 * ordinary 10-minute cooldown, a model like that returns to the front of the
 * ranking and costs the router its full 6s timeout again, repeatedly. Benching
 * it for an hour keeps that cost rare while still letting it back once the
 * provider's queue has moved on.
 */
const TIMEOUT_COOLDOWN_MS =
  Number.parseInt(process.env.MODEL_TIMEOUT_COOLDOWN_MS || '', 10) || 60 * 60 * 1000;

/** Catalogue fetches are capped tightly — this runs inside a serverless request. */
const CATALOGUE_TIMEOUT_MS = 5000;

/**
 * Most candidates any one request will try per provider.
 *
 * Without a cap, a cold instance facing NVIDIA's catalogue could make dozens of
 * doomed requests before reaching a live model, blowing the serverless time
 * budget on a single chat reply. Three is enough to clear the usual run of
 * entitlement misses while leaving room for the next provider in the chain.
 */
const MAX_MODELS_PER_REQUEST =
  Number.parseInt(process.env.MODEL_MAX_ATTEMPTS || '', 10) || 3;

/**
 * Known-good starting points, best first — measured 2026-10-02.
 *
 * Used for ranking, and as the candidate list when a catalogue cannot be read.
 * A seed is still verified by the call like anything else; if these die the way
 * the Llama 3.1 default died, the walk moves past them and remembers.
 */
const SEEDS = {
  nvidia: [
    'nvidia/nemotron-3-super-120b-a12b',
    'z-ai/glm-5.3-flash',
    'moonshotai/kimi-k3',
    'openai/gpt-oss-20b',
    'z-ai/glm-5.3',
    'nvidia/nemotron-3-ultra-550b-a55b',
  ],
  gemini: ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest'],
  openrouter: [
    'openrouter/free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'qwen/qwen3.8-27b:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
  ],
};

/**
 * Models that cannot serve a chat completion, matched by name.
 *
 * All three providers publish embedders, rerankers, safety classifiers, OCR and
 * parse models, rewards, translators, speech models and image generators in the
 * same catalogue as their chat models, with nothing but the id to tell them
 * apart. Calling one wastes a round trip and returns a shape the caller cannot
 * read. This is a denylist rather than an allowlist on purpose: a new chat model
 * should be picked up automatically, which is the whole point, while a new
 * embedder is the rare case worth missing.
 */
const NOT_CONVERSATIONAL = [
  /embed/i, /embedqa/i, /rerank/i, /retriever/i,
  /guard/i, /safety/i, /topic-control/i,
  /reward/i, /\bparse\b/i, /-parse/i, /ocr/i, /deplot/i,
  /nvclip/i, /clip$/i, /vila/i, /neva/i, /kosmos/i, /fuyu/i,
  /translate/i, /detector/i, /calibration/i,
  /diffusion/i, /lyria/i, /\bvideo\b/i, /\bimage\b/i,
  /\btts\b/i, /transcribe/i, /\bspeech\b/i, /\baudio\b/i, /nano-banana/i,
  /starcoder/i, /codegemma/i, /recurrentgemma/i,
];

/**
 * Models measured to answer the REAL router prompt inside its 6s budget,
 * best first. Per provider, because the router walks one provider at a time.
 *
 * ── Why this is a measurement and not a name heuristic ───────────────────
 *
 * This replaced `SMALL_MODEL_HINTS` — /lite/, /flash/, /mini/, /nano/ — which
 * scored a model's SPEED from its NAME. That inference is simply false, and it
 * put the worst possible model first. Measured against the actual router
 * prompt, 3 samples each, aborting at the router's own 6s budget:
 *
 *   nvidia/nemotron-3-super-120b-a12b   3/3 within 6s   490-1123ms
 *   openai/gpt-oss-20b                  3/3 within 6s   792-1105ms
 *   gemini-flash-lite-latest            3/3 within 6s   454-2347ms
 *   openrouter/free                     2/3 within 6s   1138-3935ms
 *   z-ai/glm-5.3-flash                  0/3  — median 214s unbudgeted
 *   moonshotai/kimi-k3                  0/3  — median 62s unbudgeted
 *   gemini-flash-latest                 0/3  — fastest responder of the whole
 *                                       set at 473ms median, yet 0/3 produced a
 *                                       usable CONTACT/PORTFOLIO/OTHER label
 *
 * The two models the old heuristic ranked FIRST were 250x and 74x slower than
 * the ones it ranked below them, and the fastest model in the set is unusable.
 *
 * So "flash" was the slowest thing on the list, and the `-latest` ranking bonus
 * (correct for the chat path, where an alias that never decays is exactly what
 * we want) promoted the one Gemini model that cannot classify. Both heuristics
 * were confidently wrong in opposite ways, and the only reason it was survivable
 * is that the router fails CLOSED to PORTFOLIO — the breakage was invisible
 * except as a 6s stall and a log line.
 *
 * Two of these are reasoning models that spend their whole budget thinking
 * before emitting anything, which no name exposes. Only the call reveals it —
 * the same lesson as the catalogue/entitlement split in the header.
 *
 * Measured 2026-10-05. Runtime evidence outranks this list: a model that times
 * out is benched for an hour (TIMEOUT_COOLDOWN_MS) and one that answers is
 * promoted, so this seeds a cold start rather than fixing the order forever.
 * That matters most on Vercel, where every cold start begins with no memory.
 */
const ROUTER_SEEDS = {
  nvidia: ['nvidia/nemotron-3-super-120b-a12b', 'openai/gpt-oss-20b'],
  gemini: ['gemini-flash-lite-latest', 'gemini-2.5-flash'],
  openrouter: ['openrouter/free', 'nvidia/nemotron-3-super-120b-a12b:free'],
};

// ─── Outcome memory ───────────────────────────────────────────────────────

/** `provider::model` -> { outcome, until } */
const notes = new Map();

/**
 * Record what a model actually did, so the next request starts from evidence.
 *
 * `dead` is for the statuses that condemn one model for now (404 absent, 410
 * retired, 402 priced on a credit-less account). `cooldown` is for transient
 * trouble, which must NOT be remembered as hard — a rate limit says nothing
 * about whether the model exists.
 *
 * @param {'nvidia'|'gemini'|'openrouter'} provider
 * @param {string} model
 * @param {'ok'|'dead'|'cooldown'} outcome
 */
function noteModelOutcome(provider, model, outcome, ttlOverrideMs) {
  const key = `${provider}::${model}`;
  const ttl =
    ttlOverrideMs ||
    (outcome === 'ok' ? DISCOVERY_TTL_MS : outcome === 'dead' ? DEAD_TTL_MS : COOLDOWN_MS);
  notes.set(key, { outcome, until: Date.now() + ttl });
}

function currentNote(provider, model) {
  const n = notes.get(`${provider}::${model}`);
  if (!n) return null;
  if (Date.now() >= n.until) {
    notes.delete(`${provider}::${model}`);
    return null;
  }
  return n.outcome;
}

/**
 * Classify an HTTP status: is this one model finished, or the whole provider?
 *
 * ── Why this is per-provider and not one table ───────────────────────────
 *
 * The same status means opposite things on different providers, which a single
 * table gets dangerously wrong. Measured with a deliberately invalid key:
 *
 *   NVIDIA      bad key -> 403 {"title":"Forbidden","detail":"Authorization failed"}
 *   OpenRouter  bad key -> 401 {"message":"User not found."}
 *   Gemini      bad key -> 400 INVALID_ARGUMENT "API key not valid"
 *
 * and with a VALID key against a real model:
 *
 *   OpenRouter  thinkingmachines/inkling:free -> 403 "only available on
 *               agentic harnesses"
 *
 * So a 403 condemns the provider on NVIDIA but only one model on OpenRouter,
 * and a 400 condemns the provider on Gemini. Treating OpenRouter's 403 as
 * provider-level would disable the provider whenever the walk touched
 * `inkling:free`, which has the largest free context window and therefore ranks
 * near the front.
 *
 * 402 ("Insufficient credits") is model-level on OpenRouter: it means that
 * model costs money, not that the key is broken, and every zero-priced
 * candidate behind it is still callable.
 *
 * @returns {'provider'|'model'|'transient'}
 */
function classifyStatus(provider, status) {
  if (status === 401) return 'provider';
  if (provider === 'nvidia' && status === 403) return 'provider';
  // On Gemini a 400 is either a bad key or a body this client would send
  // identically to every other Gemini model — both are provider-level.
  if (provider === 'gemini' && status === 400) return 'provider';
  if (status === 400 || status === 402 || status === 403 || status === 404 || status === 410) {
    return 'model';
  }
  return 'transient';
}

/**
 * Record an error against the model that produced it.
 *
 * Convenience for the existing catch blocks: it reads `err.status` (attached by
 * `llmClients.js`) and files the right verdict. Returns the classification so a
 * caller can stop early when the whole provider is gone.
 */
function noteModelError(provider, model, err) {
  const kind = classifyStatus(provider, err && err.status);
  if (kind === 'model') {
    noteModelOutcome(provider, model, 'dead');
  } else if (kind === 'transient') {
    // A timeout gets the longer bench; see TIMEOUT_COOLDOWN_MS.
    noteModelOutcome(provider, model, 'cooldown', err && err.timedOut ? TIMEOUT_COOLDOWN_MS : undefined);
  }
  return kind;
}

// ─── Catalogue ────────────────────────────────────────────────────────────

/** provider -> { models, fetchedAt } */
const catalogues = new Map();
/** provider -> in-flight promise, so concurrent requests cause one fetch. */
const inflight = new Map();

function baseUrlFor(provider) {
  const raw =
    provider === 'nvidia'
      ? process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1'
      : provider === 'gemini'
        ? process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
        : process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api/v1';
  // The configured value may already point at `/chat/completions`, which the
  // chat helpers accept — strip back to the API root before appending /models.
  return raw.replace(/\/chat\/completions\/?$/, '').replace(/\/$/, '');
}

function apiKeyFor(provider) {
  if (provider === 'nvidia') return process.env.NVIDIA_API_KEY;
  if (provider === 'gemini') return process.env.GEMINI_API_KEY;
  return process.env.OPENROUTER_API_KEY;
}

/**
 * True when prompt and completion are both priced at zero.
 *
 * Only those two fields decide it: `request` and `image` can be non-zero on a
 * model that is free to converse with, and treating them as disqualifying drops
 * usable models.
 */
function isZeroPriced(pricing) {
  if (!pricing || typeof pricing !== 'object') return false;
  for (const field of ['prompt', 'completion']) {
    const n = Number.parseFloat(String(pricing[field] ?? '0'));
    if (!Number.isFinite(n) || n !== 0) return false;
  }
  return true;
}

async function fetchCatalogue(provider) {
  const key = apiKeyFor(provider);
  const headers = { Accept: 'application/json' };
  // Gemini authenticates its listing with x-goog-api-key, the OpenAI-compatible
  // providers with a bearer token. OpenRouter serves /models anonymously, so a
  // missing key there is not fatal.
  if (key) {
    if (provider === 'gemini') headers['x-goog-api-key'] = key;
    else headers.Authorization = `Bearer ${key}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CATALOGUE_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrlFor(provider)}/models`, {
      headers,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    // Gemini returns { models: [...] } keyed by `name`; the OpenAI-compatible
    // providers return { data: [...] } keyed by `id`.
    const rows = Array.isArray(body.data) ? body.data : Array.isArray(body.models) ? body.models : [];
    const out = [];
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      // Gemini ids arrive as `models/gemini-2.5-flash`; the bare name is what
      // the :generateContent URL takes.
      const rawId = typeof row.id === 'string' ? row.id : typeof row.name === 'string' ? row.name : '';
      const id = rawId.replace(/^models\//, '');
      if (!id) continue;
      out.push({
        id,
        supportedParameters: Array.isArray(row.supported_parameters) ? row.supported_parameters : null,
        generationMethods: Array.isArray(row.supportedGenerationMethods)
          ? row.supportedGenerationMethods
          : null,
        free: 'pricing' in row ? isZeroPriced(row.pricing) : null,
        contextLength:
          typeof row.context_length === 'number'
            ? row.context_length
            : typeof row.inputTokenLimit === 'number'
              ? row.inputTokenLimit
              : null,
      });
    }
    return out;
  } finally {
    clearTimeout(timer);
  }
}

async function catalogueFor(provider) {
  const cached = catalogues.get(provider);
  if (cached && Date.now() - cached.fetchedAt < DISCOVERY_TTL_MS) return cached.models;

  const pending = inflight.get(provider);
  if (pending) return pending;

  const p = fetchCatalogue(provider)
    .then((models) => {
      catalogues.set(provider, { models, fetchedAt: Date.now() });
      return models;
    })
    .catch((e) => {
      // Fail soft. An unreachable catalogue must not take the provider down —
      // the configured list and the seeds are still there.
      console.error(
        `[model-discovery] ${provider} catalogue unavailable (${e.message}); using configured models`
      );
      return [];
    })
    .finally(() => inflight.delete(provider));

  inflight.set(provider, p);
  return p;
}

// ─── Ranking ──────────────────────────────────────────────────────────────

function parseList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Whatever the operator pinned through the environment, in their order. */
function configuredList(provider) {
  if (provider === 'nvidia') return parseList(process.env.NVIDIA_MODELS || process.env.NVIDIA_MODEL);
  if (provider === 'gemini') return parseList(process.env.GEMINI_MODELS || process.env.GEMINI_MODEL);
  return parseList(process.env.CHAT_MODELS || process.env.CHAT_MODEL);
}

function admissible(provider, m) {
  if (NOT_CONVERSATIONAL.some((rx) => rx.test(m.id))) return false;

  if (provider === 'gemini') {
    // Real capability data, so this is a genuine check rather than a heuristic.
    if (m.generationMethods && !m.generationMethods.includes('generateContent')) return false;
  }

  if (provider === 'openrouter') {
    // This key has never purchased credits, so a priced model cannot be called
    // at all. OPENROUTER_ALLOW_PAID=1 lifts this once credits exist.
    if (process.env.OPENROUTER_ALLOW_PAID !== '1' && m.free === false) return false;
  }
  return true;
}

/**
 * Ordering signals only — higher is tried sooner. No magic totals.
 *
 * `forRouter` switches which measured seed list leads and drops the chat-path
 * signals, because what makes a good chat model (big context, newest alias) is
 * unrelated to what the router needs (an answer inside 6 seconds).
 */
function score(provider, id, m, forRouter) {
  let s = 0;

  const seeds = forRouter ? ROUTER_SEEDS[provider] : SEEDS[provider];
  const seedIdx = seeds.indexOf(id);
  if (seedIdx >= 0) s += 1000 - seedIdx;

  // Anything this instance has actually seen work outranks an unproven seed.
  const note = currentNote(provider, id);
  if (note === 'ok') s += 5000;
  if (note === 'cooldown') s -= 2000;

  if (!forRouter) {
    // A `-latest` alias is maintained by the provider, so it is the one name
    // that does not decay — the exact failure this module exists to prevent.
    // Chat path only: for the router this bonus promoted gemini-flash-latest,
    // which answers fast but never returns a usable label (see ROUTER_SEEDS).
    if (/-latest$/.test(id)) s += 400;

    // Context length as a tie-breaker, compressed so it never outweighs proven
    // behaviour. Irrelevant for the router, which sends a single short turn.
    if (m && m.contextLength) s += Math.min(50, Math.log10(m.contextLength) * 8);
  }

  return s;
}

/**
 * Ranked chat-model candidates for a provider, best first.
 *
 * Union of three sources, deduplicated: what the operator configured, what the
 * live catalogue offers, and the measured seeds. Configured names are kept even
 * when the catalogue omits them, because pinning a model is a deliberate act and
 * a catalogue read can fail.
 *
 * @param {'nvidia'|'gemini'|'openrouter'} provider
 * @param {{ forRouter?: boolean, limit?: number }} [opts]
 * @returns {Promise<string[]>}
 */
async function resolveModelList(provider, opts = {}) {
  const catalogue = await catalogueFor(provider);
  const byId = new Map(catalogue.map((m) => [m.id, m]));

  const candidates = new Set([
    ...configuredList(provider),
    ...catalogue.filter((m) => admissible(provider, m)).map((m) => m.id),
    ...SEEDS[provider],
    ...(opts.forRouter ? ROUTER_SEEDS[provider] : []),
  ]);

  const ranked = [...candidates]
    .filter((id) => currentNote(provider, id) !== 'dead')
    .sort((a, b) => score(provider, b, byId.get(b), opts.forRouter) - score(provider, a, byId.get(a), opts.forRouter));

  // Bound what any single request will attempt; see MAX_MODELS_PER_REQUEST.
  const limit = opts.limit || MAX_MODELS_PER_REQUEST;
  const capped = ranked.slice(0, limit);
  // Never hand back an empty list — a caller treats that as "provider not
  // usable" and skips it, which would be wrong just because discovery failed.
  const fallback = opts.forRouter ? ROUTER_SEEDS[provider] : SEEDS[provider];
  return capped.length > 0 ? capped : fallback.slice(0, limit);
}

/**
 * Default token budget for the semantic router.
 *
 * The router asks for a single word, so this was 8 tokens — a budget that was
 * correct before small models began spending hidden reasoning tokens before
 * answering. Measured against the real router prompt:
 *
 *   z-ai/glm-5.3-flash   max_tokens=8   -> finish=length, content=''
 *                        max_tokens=64  -> 'CONTACT'
 *   moonshotai/kimi-k3   max_tokens=64  -> finish=stop,   content=''
 *                        max_tokens=256 -> 'CONTACT'
 *   openrouter/free      max_tokens=8   -> 'CONTACT'
 *                        max_tokens=256 -> finish=length, content=''
 *
 * So an 8-token budget silently broke intent routing on every reasoning model,
 * and `openrouter/free` — an auto-router that picks its own backing model per
 * request — is not even consistent with itself. There is therefore no single
 * safe budget, which is why `resolveRouterModels` returns a LIST: an empty reply
 * is a failure the caller walks past. 256 covers every model measured above.
 *
 * Do NOT lower this hoping for speed: latency here is not budget-driven.
 * `z-ai/glm-5.3-flash` took 13.5s at max_tokens=64 and 3.0s at 128 on the same
 * prompt, so the variance is the provider's queue, not the token count. The 6s
 * timeout plus the candidate walk is what bounds latency.
 */
const ROUTER_MAX_TOKENS = Number.parseInt(process.env.ROUTER_MAX_TOKENS || '', 10) || 256;

/**
 * Cheapest adequate models for the semantic router, best first.
 *
 * A list rather than one name because a model that answers with nothing but
 * hidden reasoning is useless to the router and must be walked past — see
 * ROUTER_MAX_TOKENS for the measurements.
 *
 * @param {'nvidia'|'gemini'|'openrouter'} provider
 * @returns {Promise<string[]>}
 */
async function resolveRouterModels(provider) {
  const envPin =
    provider === 'nvidia'
      ? process.env.NVIDIA_ROUTER_MODEL
      : provider === 'gemini'
        ? process.env.GEMINI_ROUTER_MODEL
        : process.env.ROUTER_MODEL;
  // A pin is a deliberate act and is used alone, so a dead pin stays visible
  // rather than being silently papered over.
  if (envPin) return [envPin];
  return resolveModelList(provider, { forRouter: true, limit: 3 });
}

/** Test/diagnostic hook — clears both caches. */
function _resetForTesting() {
  notes.clear();
  catalogues.clear();
}

module.exports = {
  resolveModelList,
  resolveRouterModels,
  ROUTER_MAX_TOKENS,
  noteModelOutcome,
  noteModelError,
  classifyStatus,
  _resetForTesting,
};
