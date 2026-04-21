/**
 * Shared chat completion clients.
 * Provider priority (for consumers): NVIDIA NIM -> Google AI Studio (Gemini) -> OpenRouter.
 * Each function is a single-provider call; orchestration/fallback is done by the caller.
 * All outbound calls are wrapped with an AbortController timeout so a hung provider
 * can't hang the request (Vercel serverless max is ~10s on hobby, 60s on pro).
 */

/** Default timeout for non-streaming completions. Override via env LLM_TIMEOUT_MS. */
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.LLM_TIMEOUT_MS || '', 10) || 15000;

/**
 * fetch() with an AbortController timeout.
 * Throws `Error('LLM request timed out after Xms')` on timeout.
 */
async function fetchWithTimeout(url, init = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (e && (e.name === 'AbortError' || controller.signal.aborted)) {
      throw new Error(`LLM request timed out after ${timeoutMs}ms`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/**
 * NVIDIA NIM chat completion (OpenAI-compatible endpoint).
 * Docs: https://build.nvidia.com/  (integrate.api.nvidia.com/v1)
 *
 * @param {Array<{ role: string; content: string }>} messages
 * @param {string} apiKey
 * @param {string} [model]
 * @param {{ maxTokens?: number; temperature?: number; baseURL?: string; responseFormatJson?: boolean; timeoutMs?: number }} [options]
 */
async function chatCompletionNvidia(messages, apiKey, model, options = {}) {
  const max_tokens = options.maxTokens ?? 512;
  const temperature = options.temperature ?? 0.3;
  const base = options.baseURL || process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const url = base.endsWith('/chat/completions')
    ? base
    : base.replace(/\/$/, '') + '/chat/completions';

  const body = {
    model: model || process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct',
    messages,
    max_tokens,
    temperature,
  };
  if (options.responseFormatJson) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    },
    options.timeoutMs
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NVIDIA NIM API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (content == null || (typeof content === 'string' && content.trim() === '')) {
    const reason = data.choices?.[0]?.finish_reason;
    throw new Error(
      `No content in NVIDIA NIM response${reason != null ? ` (finish_reason: ${reason})` : ''}`
    );
  }
  return content;
}

/**
 * @param {Array<{ role: string; content: string }>} messages
 * @param {string} apiKey
 * @param {string} [baseURL]
 * @param {string} [model]
 * @param {{ maxTokens?: number; temperature?: number; responseFormatJson?: boolean; timeoutMs?: number }} [options]
 */
async function chatCompletion(messages, apiKey, baseURL, model, options = {}) {
  const max_tokens = options.maxTokens ?? 512;
  const temperature = options.temperature ?? 0.3;
  const base = baseURL || 'https://openrouter.ai/api/v1';
  const url = base.endsWith('/chat/completions')
    ? base
    : base.replace(/\/$/, '') + '/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  if (process.env.OPENROUTER_SITE_URL) headers['HTTP-Referer'] = process.env.OPENROUTER_SITE_URL;
  if (process.env.OPENROUTER_APP_NAME) headers['X-Title'] = process.env.OPENROUTER_APP_NAME;

  const body = {
    model: model || process.env.CHAT_MODEL || 'google/gemma-2-9b-it:free',
    messages,
    max_tokens,
    temperature,
  };
  if (options.responseFormatJson) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
    options.timeoutMs
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (content == null || (typeof content === 'string' && content.trim() === '')) {
    const reason = data.choices?.[0]?.finish_reason ?? data.choices?.[0]?.native_finish_reason;
    throw new Error(
      `No content in OpenRouter response${reason != null ? ` (finish_reason: ${reason})` : ''}`
    );
  }
  return content;
}

/**
 * @param {Array<{ role: string; content: string }>} messages
 * @param {string} apiKey
 * @param {string} [model]
 * @param {{ maxTokens?: number; temperature?: number; responseMimeType?: string; timeoutMs?: number }} [options]
 *        responseMimeType e.g. "application/json" — forces valid JSON from supported Gemini models.
 */
async function chatCompletionGemini(messages, apiKey, model, options = {}) {
  const maxOutputTokens = options.maxTokens ?? 8192;
  const temperature = options.temperature ?? 0.3;
  const m = model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    m
  )}:generateContent`;

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const generationConfig = {
    maxOutputTokens,
    temperature,
  };
  if (options.responseMimeType) {
    generationConfig.responseMimeType = options.responseMimeType;
  }

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents,
        generationConfig,
      }),
    },
    options.timeoutMs
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate) {
    const block = data.promptFeedback?.blockReason;
    throw new Error(
      block ? `Gemini blocked the prompt: ${block}` : 'No candidates in Gemini response'
    );
  }
  const finish = candidate.finishReason;
  if (finish && finish !== 'STOP' && finish !== 'MAX_TOKENS') {
    throw new Error(`Gemini finishReason=${finish} (try a different model or shorten the input)`);
  }
  const parts = candidate.content?.parts || [];
  const text = parts
    .map((p) => (typeof p.text === 'string' ? p.text : ''))
    .join('')
    .trim();
  if (!text) throw new Error('No text in Gemini response');
  if (finish === 'MAX_TOKENS') {
    throw new Error(
      'Gemini hit max output tokens (response truncated). Raise ATS_MAX_TOKENS or use a smaller request.'
    );
  }
  return text;
}

module.exports = {
  chatCompletionNvidia,
  chatCompletion,
  chatCompletionGemini,
  fetchWithTimeout,
  DEFAULT_TIMEOUT_MS,
};
