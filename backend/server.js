/**
 * Portfolio Chatbot API – RAG-style pipeline
 * Uses knowledge.json as context (resume/portfolio). Later: add MCP-style tools (ATS, cover letter, resume tailoring).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const KNOWLEDGE_PATH = path.join(__dirname, 'data', 'knowledge.json');
const PORT = process.env.PORT || 5000;

/** Flatten skills from structured (byCategory or flat) or legacy array */
function getSkillsList(k) {
  const s = k.skills;
  if (!s) return [];
  if (Array.isArray(s)) return s;
  if (s.flat && Array.isArray(s.flat)) return s.flat;
  if (s.byCategory && typeof s.byCategory === 'object') {
    return Object.values(s.byCategory).flat().filter(Boolean);
  }
  return [];
}

/** Build system prompt from knowledge (RAG: inject full context; supports structured schema for future vector/graph DB) */
function buildRAGContext() {
  let raw;
  try {
    raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
  } catch (e) {
    return 'No knowledge base loaded.';
  }
  const k = JSON.parse(raw);
  const about = k.about || {};
  const roles = (about.roles || []).join(', ');
  const skillsList = getSkillsList(k);
  const statsForRag = computeStats(k);
  const lines = [
    'You are a helpful, professional assistant for Swapnil Mane\'s portfolio.',
    'STRICT RULES (to avoid hallucination):',
    '1. Answer ONLY using the facts stated in the CONTEXT below. Do not invent names, dates, projects, skills, or links.',
    '2. If the answer is not in the CONTEXT, say clearly: "I don\'t have that information in my context" and suggest visiting the portfolio or LinkedIn.',
    '3. Do not generalize or assume anything not explicitly in the CONTEXT. When in doubt, say you don\'t know.',
    '4. Keep answers concise and friendly.',
    '',
    '--- CONTEXT (use only this information) ---',
    '',
    '--- ABOUT ---',
    `Name: ${about.name || 'Swapnil Mane'}. Roles: ${roles}.`,
    about.summary || about.description || '',
    about.tagline ? `Tagline: ${about.tagline}` : '',
    `Stats: ${statsForRag.yearsOfExperience}+ years experience, ${statsForRag.numProjects} projects, ${statsForRag.numOrganizations} organizations.`,
    `Links: LinkedIn ${about.social?.linkedin || ''}, GitHub ${about.social?.github || ''}, LeetCode ${about.social?.leetcode || ''}.`,
    ''
  ];

  if (k.narrative || k.journey) {
    lines.push('--- BACKGROUND / NARRATIVE ---', '', k.narrative || k.journey, '');
  }

  if (k.education && k.education.length) {
    lines.push('--- EDUCATION ---', '');
    k.education.forEach(ed => {
      lines.push(`${ed.institution} | ${ed.degree}${ed.gpa ? ` | GPA ${ed.gpa}` : ''} | ${ed.endDate || ''}${ed.location ? ` | ${ed.location}` : ''}`);
      if (ed.coursework && ed.coursework.length) lines.push(`  Coursework: ${ed.coursework.join(', ')}`);
    });
    lines.push('');
  }

  if (k.experience && k.experience.length) {
    lines.push('--- PROFESSIONAL EXPERIENCE ---', '');
    k.experience.forEach(exp => {
      lines.push(`${exp.organization} | ${exp.role} | ${exp.startDate || ''} - ${exp.endDate || ''} (${exp.type || 'full-time'})`);
      if (exp.techStack && exp.techStack.length) lines.push(`  Tech: ${exp.techStack.join(', ')}`);
      (exp.bullets || []).forEach(b => lines.push(`  - ${b}`));
    });
    lines.push('');
  }

  lines.push('--- SKILLS ---', '', skillsList.join(', '), '');

  if (k.certifications && k.certifications.length) {
    lines.push('--- CERTIFICATIONS ---', '');
    k.certifications.forEach(c => {
      lines.push(`- ${c.name}${c.date ? ` (${c.date})` : ''}${c.issuer ? ` | ${c.issuer}` : ''}`);
    });
    lines.push('');
  }

  if (k.leadership && k.leadership.length) {
    lines.push('--- LEADERSHIP ---', '');
    k.leadership.forEach(l => lines.push(`- ${l.role}${l.organization ? `, ${l.organization}` : ''}${l.date ? ` (${l.date})` : ''}`));
    lines.push('');
  }

  if (k.achievements && k.achievements.length) {
    lines.push('--- ACHIEVEMENTS ---', '');
    k.achievements.forEach(a => {
      lines.push(`- ${a.title}${a.organization ? ` at ${a.organization}` : ''}: ${a.description}`);
      if (a.metrics && a.metrics.length) lines.push(`  Metrics: ${a.metrics.join('; ')}`);
    });
    lines.push('');
  }

  lines.push('--- CONTACT ---', '', (k.contact?.email ? `Email: ${k.contact.email}` : '') + (k.contact?.emailAlternate ? `; Alternate: ${k.contact.emailAlternate}` : ''), '', '--- PROJECTS ---', '');

  (k.projects || []).forEach(p => {
    lines.push(`- ${p.name}: ${p.description} [${(p.stack || []).join(', ')}]`);
    if (p.sourceCode) lines.push(`  Source: ${p.sourceCode}`);
    if (p.livePreview) lines.push(`  Preview: ${p.livePreview}`);
  });

  return lines.filter(Boolean).join('\n');
}

const RAG_SYSTEM_PROMPT = buildRAGContext();

/** OpenRouter chat completion (non-streaming, OpenAI-compatible) */
async function chatCompletion(messages, apiKey, baseURL, model) {
  const base = baseURL || 'https://openrouter.ai/api/v1';
  const url = base.endsWith('/chat/completions')
    ? base
    : base.replace(/\/$/, '') + '/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || process.env.CHAT_MODEL || 'google/gemma-2-9b-it:free',
      messages,
      max_tokens: 512,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (content == null) throw new Error('No content in OpenRouter response');
  return content;
}

/** Gemini chat completion (non-streaming) */
async function chatCompletionGemini(messages, apiKey, model) {
  const m = model || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    m
  )}:generateContent`;

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((p) => (typeof p.text === 'string' ? p.text : ''))
    .join('')
    .trim();
  if (!text) throw new Error('No text in Gemini response');
  return text;
}

/** Gemini streaming -> forward tokens as SSE (streamGenerateContent) */
async function streamGeminiAsSSE(messages, apiKey, model, res) {
  const m = model || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    m
  )}:streamGenerateContent`;

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const llmRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({ contents }),
  });

  if (!llmRes.ok) {
    const err = await llmRes.text();
    throw new Error(`Gemini stream error ${llmRes.status}: ${err}`);
  }

  const reader = llmRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let started = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Gemini stream: SSE-like events "data: {...}\n\n" or NDJSON lines
      const parts = buffer.split('\n');
      buffer = parts.pop() || '';

      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let data;
        if (trimmed.startsWith('data: ')) {
          try {
            data = JSON.parse(trimmed.slice(6));
          } catch (_) {
            continue;
          }
        } else {
          try {
            data = JSON.parse(trimmed);
          } catch (_) {
            continue;
          }
        }
        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => (typeof p.text === 'string' ? p.text : ''))
          .join('') || '';
        if (text) {
          started = true;
          sendSSE(res, { content: text });
        }
      }
    }

    if (buffer.trim()) {
      try {
        const data = buffer.trim().startsWith('data: ')
          ? JSON.parse(buffer.trim().slice(6))
          : JSON.parse(buffer.trim());
        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => (typeof p.text === 'string' ? p.text : ''))
          .join('') || '';
        if (text) {
          started = true;
          sendSSE(res, { content: text });
        }
      } catch (_) {}
    }
  } catch (e) {
    if (started) {
      console.error('Gemini stream interrupted:', e.message || e);
      sendSSE(res, { done: true });
      return { started: true };
    }
    throw e;
  }

  if (started) sendSSE(res, { done: true });
  return { started };
}

function parseCommaList(value, fallback) {
  const raw = (value ?? fallback ?? '').toString();
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Send one SSE event to the client */
function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/** Helper: stream a plain text reply as SSE chunks */
function streamTextAsSSE(res, text) {
  const chunks = (text || '').match(/.{1,120}/g) || [''];
  chunks.forEach((chunk) => {
    if (chunk) sendSSE(res, { content: chunk });
  });
  sendSSE(res, { done: true });
}

/** OpenRouter streaming -> forward tokens as SSE */
async function streamOpenRouterAsSSE(messages, apiKey, baseURL, model, res) {
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

  const llmRes = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 512,
      temperature: 0.3,
      stream: true,
    }),
  });

  if (!llmRes.ok) {
    const err = await llmRes.text();
    throw new Error(`OpenRouter stream error ${llmRes.status}: ${err}`);
  }

  const reader = llmRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let started = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // OpenAI-compatible streaming is SSE: events separated by \n\n
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const dataLine = event
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.startsWith('data: '));
        if (!dataLine) continue;
        const raw = dataLine.slice(6).trim();
        if (raw === '[DONE]') continue;
        try {
          const data = JSON.parse(raw);
          const content = data.choices?.[0]?.delta?.content;
          if (typeof content === 'string' && content) {
            started = true;
            sendSSE(res, { content });
          }
        } catch (_) {
          // ignore non-JSON chunks
        }
      }
    }

    // Process trailing buffer (in case it ends without \n\n)
    if (buffer.trim().startsWith('data: ')) {
      const raw = buffer.trim().slice(6).trim();
      if (raw && raw !== '[DONE]') {
        try {
          const data = JSON.parse(raw);
          const content = data.choices?.[0]?.delta?.content;
          if (typeof content === 'string' && content) {
            started = true;
            sendSSE(res, { content });
          }
        } catch (_) {}
      }
    }
  } catch (e) {
    // If we already started streaming tokens, end politely; otherwise let caller try another model.
    if (started) {
      console.error('OpenRouter stream interrupted:', e.message || e);
      sendSSE(res, { done: true });
      return { started: true };
    }
    throw e;
  }

  if (started) sendSSE(res, { done: true });
  return { started };
}

/** POST /api/chat – single turn (optionally with history for context) */
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "message"' });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openRouterKey && !geminiKey) {
    return res.status(503).json({
      error: 'Chat not configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY in the server environment.',
    });
  }

  const baseURL = process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api/v1';
  const modelsEnv = process.env.CHAT_MODELS || process.env.CHAT_MODEL || 'google/gemma-2-9b-it:free';
  const modelList = parseCommaList(modelsEnv, 'google/gemma-2-9b-it:free');
  const geminiModelsEnv =
    process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
  const geminiModelList = parseCommaList(geminiModelsEnv, 'gemini-3-flash-preview');

  const systemMessage = { role: 'system', content: RAG_SYSTEM_PROMPT };
  const historyMessages = (Array.isArray(history) ? history : [])
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: typeof m.content === 'string' ? m.content : String(m.content)
    }));
  const userMessage = { role: 'user', content: message.trim() };
  const messages = [systemMessage, ...historyMessages, userMessage];

  try {
    // 1) Try OpenRouter models (if configured)
    if (openRouterKey && modelList.length) {
      let lastError;
      for (const m of modelList) {
        try {
          const reply = await chatCompletion(messages, openRouterKey, baseURL, m);
          return res.json({ reply, provider: 'openrouter', model: m });
        } catch (e) {
          lastError = e;
          console.error(`OpenRouter model "${m}" failed:`, e.message || e);
        }
      }
      if (!geminiKey) {
        console.error('All OpenRouter models failed.', lastError);
        return res.status(503).json({
          error: 'Chat is temporarily unavailable. Please try again later.',
        });
      }
    }

    // 2) Fallback to Gemini (if configured)
    if (geminiKey) {
      let lastGeminiError;
      for (const gm of geminiModelList) {
        try {
          const reply = await chatCompletionGemini(messages, geminiKey, gm);
          return res.json({ reply, provider: 'gemini', model: gm });
        } catch (e) {
          lastGeminiError = e;
          console.error(`Gemini model "${gm}" failed:`, e.message || e);
        }
      }
      console.error('All Gemini models failed.', lastGeminiError);
      return res.status(503).json({
        error: 'Chat is temporarily unavailable. Please try again later.',
      });
    }

    // Should not reach here, but just in case
    return res.status(503).json({
      error: 'Chat is temporarily unavailable. Please try again later.',
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Chat is temporarily unavailable. Please try again later.' });
  }
});

/** POST /api/chat/stream – same as /api/chat but streams reply via Server-Sent Events (SSE) */
app.post('/api/chat/stream', async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "message"' });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const systemMessage = { role: 'system', content: RAG_SYSTEM_PROMPT };
  const historyMessages = (Array.isArray(history) ? history : [])
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: typeof m.content === 'string' ? m.content : String(m.content)
    }));
  const userMessage = { role: 'user', content: message.trim() };
  const messages = [systemMessage, ...historyMessages, userMessage];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  // If neither provider is configured, send a polite error via SSE.
  if (!openRouterKey && !geminiKey) {
    streamTextAsSSE(
      res,
      "I'm having trouble answering right now. Please try again in a moment."
    );
    return res.end();
  }

  const baseURL = process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api/v1';
  const modelsEnv = process.env.CHAT_MODELS || process.env.CHAT_MODEL || 'google/gemma-2-9b-it:free';
  const modelList = parseCommaList(modelsEnv, 'google/gemma-2-9b-it:free');
  const geminiModelsEnv =
    process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
  const geminiModelList = parseCommaList(geminiModelsEnv, 'gemini-3-flash-preview');

  try {
    // 1) Try OpenRouter models (if configured)
    if (openRouterKey && modelList.length) {
      let lastError;
      for (const m of modelList) {
        try {
          const { started } = await streamOpenRouterAsSSE(messages, openRouterKey, baseURL, m, res);
          if (started) return res.end();
          // If no tokens were produced, treat as failure and try next model.
          lastError = new Error(`No tokens produced for model "${m}"`);
        } catch (e) {
          lastError = e;
          console.error(`OpenRouter model "${m}" failed (stream):`, e.message || e);
        }
      }
      if (!geminiKey) {
        console.error('All OpenRouter models (stream) failed.', lastError);
        streamTextAsSSE(
          res,
          "I'm having trouble answering right now. Please try again in a moment."
        );
        return res.end();
      }
    }

    // 2) Fallback to Gemini (if configured) – try native streaming first, then non-stream
    if (geminiKey) {
      let lastGeminiError;
      for (const gm of geminiModelList) {
        try {
          const { started } = await streamGeminiAsSSE(messages, geminiKey, gm, res);
          if (started) return res.end();
          lastGeminiError = new Error(`No tokens produced for Gemini model "${gm}"`);
        } catch (e) {
          lastGeminiError = e;
          console.error(`Gemini model "${gm}" failed (stream):`, e.message || e);
          try {
            const reply = await chatCompletionGemini(messages, geminiKey, gm);
            streamTextAsSSE(res, reply);
            return res.end();
          } catch (e2) {
            lastGeminiError = e2;
          }
        }
      }
      console.error('All Gemini models (stream) failed.', lastGeminiError);
      streamTextAsSSE(
        res,
        "I'm having trouble answering right now. Please try again in a moment."
      );
      return res.end();
    }

    streamTextAsSSE(
      res,
      "I'm having trouble answering right now. Please try again in a moment."
    );
    return res.end();
  } catch (e) {
    console.error('Unexpected error in /api/chat/stream:', e.message || e);
    streamTextAsSSE(
      res,
      "I'm having trouble answering right now. Please try again in a moment."
    );
    return res.end();
  }
});

/** GET /api/profile – single source of truth for portfolio UI (from knowledge.json; later vector/graph DB) */
function loadKnowledge() {
  try {
    const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/** Parse YYYY-MM or "Present" to a Date; returns null if invalid */
function parseExperienceDate(value) {
  if (!value || typeof value !== 'string') return null;
  const s = value.trim();
  if (s.toLowerCase() === 'present') return new Date();
  const match = s.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const d = new Date(year, month, 1);
  return isNaN(d.getTime()) ? null : d;
}

/** Compute stats from knowledge: projects count, unique organizations, years of experience (career span) */
function computeStats(k) {
  const projects = k.projects || [];
  const experience = k.experience || [];
  const numProjects = projects.length;
  const orgs = new Set(experience.map((e) => e.organization).filter(Boolean));
  const numOrganizations = orgs.size;
  let yearsOfExperience = 0;
  if (experience.length > 0) {
    let minStart = null;
    let maxEnd = null;
    for (const e of experience) {
      const start = parseExperienceDate(e.startDate);
      const end = parseExperienceDate(e.endDate);
      if (start) minStart = minStart ? (start < minStart ? start : minStart) : start;
      if (end) maxEnd = maxEnd ? (end > maxEnd ? end : maxEnd) : end;
    }
    if (minStart && maxEnd && maxEnd >= minStart) {
      yearsOfExperience = Math.floor((maxEnd - minStart) / (365.25 * 24 * 60 * 60 * 1000));
    }
  }
  return { yearsOfExperience: Math.max(0, yearsOfExperience - 1), numProjects, numOrganizations };
}

app.get('/api/profile', (req, res) => {
  const k = loadKnowledge();
  if (!k) {
    return res.status(503).json({ error: 'Profile not available' });
  }
  const about = k.about || {};
  const roles = about.roles || [];
  const computed = computeStats(k);
  const stats = about.stats || {};
  const site = k.site || {};
  const journeyDisplay = k.journeyDisplay || {};
  const profile = {
    header: {
      homepage: site.homepage || 'https://swapnilmane22.github.io/portfolio/',
      title: site.title || 'SM',
    },
    about: {
      name: about.name || 'Swapnil Mane',
      role: roles[0] || '',
      role2: roles[1] || '',
      role3: roles[2] || '',
      description: about.description || about.summary || '',
      social: about.social || {},
    },
    journey: {
      intro: journeyDisplay.introHtml || k.narrative || '',
      yoe: stats.yearsOfExperience ?? computed.yearsOfExperience,
      numProjects: stats.numberOfProjects ?? computed.numProjects,
      numOrganizations: stats.numberOfOrganizations ?? computed.numOrganizations,
    },
    projects: (k.projects || []).map((p) => ({
      name: p.name,
      description: p.description,
      stack: p.stack || [],
      sourceCode: p.sourceCode || undefined,
      livePreview: p.livePreview || undefined,
      imageKey: p.imageKey || undefined,
    })),
    skills: getSkillsList(k),
    contact: k.contact || {},
  };
  res.json(profile);
});

/** Health check for hosting platforms */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, rag: !!RAG_SYSTEM_PROMPT });
});

// Export for Vercel serverless (api/[[...path]].js); run server when executed directly (local)
module.exports = app;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Portfolio chatbot API running on port ${PORT}`);
  });
}
