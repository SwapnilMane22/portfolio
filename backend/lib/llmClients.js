/**
 * Shared OpenRouter + Gemini chat completions (same behavior as portfolio chatbot).
 * Used by server.js and the ATS Engine (via package export `portfolio-backend/llm`).
 */

/**
 * @param {Array<{ role: string; content: string }>} messages
 * @param {string} apiKey
 * @param {string} [baseURL]
 * @param {string} [model]
 * @param {{ maxTokens?: number; temperature?: number; responseFormatJson?: boolean }} [options]
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

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
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
 * @param {{ maxTokens?: number; temperature?: number; responseMimeType?: string }} [options]
 *        responseMimeType e.g. "application/json" — forces valid JSON from supported Gemini models.
 */
async function chatCompletionGemini(messages, apiKey, model, options = {}) {
  const maxOutputTokens = options.maxTokens ?? 8192;
  const temperature = options.temperature ?? 0.3;
  const m = model || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
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

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents,
      generationConfig,
    }),
  });

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
  chatCompletion,
  chatCompletionGemini,
};
