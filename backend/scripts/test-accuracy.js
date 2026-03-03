/**
 * RAG pipeline accuracy test (uses portfolio/backend/data/knowledge.json).
 *
 * How to run:
 *   1. Start the backend: npm start  (from portfolio/backend)
 *   2. Run tests:        node scripts/test-accuracy.js   OR   npm run test:accuracy
 *   Optional: CHAT_API_BASE=http://localhost:5000 node scripts/test-accuracy.js
 *
 * Each test sends a question to /api/chat and checks the reply for expected/forbidden
 * strings. Outputs: per-test pass/fail, latency, and RAG metrics (pass rate, recall, etc.).
 */
const BASE = process.env.CHAT_API_BASE || 'http://localhost:5000';

// Test cases aligned with knowledge.json — cover about, education, skills, experience, projects, certifications, leadership, achievements, contact, refusal
const TEST_CASES = [
  // --- About & summary ---
  {
    name: 'About – experience and roles',
    message: "How many years of experience does Swapnil have and what are his roles?",
    expectContains: ['5', 'Software Engineer', 'AI'],
    expectNotContain: ['2 years', 'intern only'],
  },
  {
    name: 'About – tagline',
    message: "What is Swapnil's tagline or how does he describe his work style?",
    expectContains: ['production', 'fast'],
    expectNotContain: [],
  },
  // --- Education (college short forms: SUNYB = Binghamton/SUNY, FCRIT = Fr. C. Rodrigues) ---
  {
    name: 'Education – graduate',
    message: "Where did Swapnil do his Master's? What degree and GPA?",
    expectContains: ['Computer Science', 'Master', '3.71'],
    expectContainsAny: [['Binghamton', 'SUNYB', 'SUNY']],
    expectNotContain: ['PhD'],
  },
  {
    name: 'Education – undergrad',
    message: "Where did Swapnil do his Bachelor's? What field?",
    expectContains: ['Mumbai', 'Electronics'],
    expectContainsAny: [['Rodrigues', 'FCRIT']],
    expectNotContain: [],
  },
  // --- Skills ---
  {
    name: 'Skills – programming and ML',
    message: "What are Swapnil's technical skills?",
    expectContains: ['Python', 'Machine Learning'],
    expectNotContain: ['Swift', 'Angular'],
  },
  {
    name: 'Skills – frameworks and cloud',
    message: "Does Swapnil use PyTorch, Azure, or Databricks?",
    expectContains: ['PyTorch', 'Azure', 'Databricks'].slice(0, 2),
    expectNotContain: [],
  },
  {
    name: 'Skills – SAP',
    message: "Does Swapnil have SAP or ABAP experience?",
    expectContains: ['SAP', 'ABAP'],
    expectNotContain: [],
  },
  // --- Experience ---
  {
    name: 'Experience – current job',
    message: "Where does Swapnil work now? What is his current role?",
    expectContains: ['Asearis', 'Software Engineer'],
    expectNotContain: [],
  },
  {
    name: 'Experience – Asearis (Rust, LLM)',
    message: "What did Swapnil do at Asearis? Any Rust or LLM work?",
    expectContains: ['Rust', 'LLM'],
    expectNotContain: [],
  },
  {
    name: 'Experience – Sitewiz',
    message: "What was Swapnil's role at Sitewiz? Any cloud or AutoGen?",
    expectContains: ['AutoGen', 'AI'],
    expectNotContain: [],
  },
  {
    name: 'Experience – Bridge Green (battery)',
    message: "What did Swapnil do at Bridge Green Upcycle? Battery or SOH?",
    expectContains: ['battery', 'soh', '90'],
    expectNotContain: [],
  },
  {
    name: 'Experience – LTIMindtree NLP',
    message: "Did Swapnil work on NLP or ticket classification at LTIMindtree?",
    expectContains: ['NLP', 'ticket'],
    expectNotContain: [],
  },
  {
    name: 'Experience – LTIMindtree SAP',
    message: "Did Swapnil do SAP ABAP at LTIMindtree? Any awards?",
    expectContains: ['SAP', 'ABAP', 'GoMx'],
    expectNotContain: [],
  },
  // --- Projects ---
  {
    name: 'Project – battery/SOH',
    message: "Does Swapnil have a project about battery or state of health?",
    expectContains: ['battery', '90'],
    expectContainsAny: [['state of health', 'state-of-health', 'soh']],
    expectNotContain: [],
  },
  {
    name: 'Project – Text-to-SQL',
    message: "Does Swapnil have a multi-agent or Text-to-SQL project?",
    expectContains: ['sql', 'autogen', 'ollama'],
    expectNotContain: [],
  },
  {
    name: 'Project – Chatbot / RAG',
    message: "Does he have a chatbot or RAG project?",
    expectContains: ['chatbot', 'rag'],
    expectNotContain: [],
  },
  {
    name: 'Project – movie recommender',
    message: "Any movie recommendation or SBERT project?",
    expectContains: ['movie', 'tf-idf'],
    expectNotContain: [],
  },
  {
    name: 'Project – thought to text / EEG',
    message: "Any project on thought-to-text or EEG?",
    expectContains: ['eeg', 'thought'],
    expectNotContain: [],
  },
  // --- Certifications & leadership ---
  {
    name: 'Certifications',
    message: "What certifications does Swapnil have?",
    expectContains: ['Microsoft', 'Python'],
    expectNotContain: ['AWS Certified', 'PhD'],
  },
  {
    name: 'Leadership',
    message: "Any leadership role? Placement or career coordinator?",
    expectContains: ['placement', 'career'],
    expectContainsAny: [['Rodrigues', 'FCRIT']],
    expectNotContain: [],
  },
  // --- Achievements ---
  {
    name: 'Achievements – GoMx',
    message: "What award did Swapnil get at LTIMindtree? Monitoring or efficiency?",
    expectContains: ['GoMx', '86', '67'],
    expectNotContain: [],
  },
  // --- Contact & social ---
  {
    name: 'Contact – email',
    message: "What is Swapnil's contact email?",
    expectContains: ['stm2212', 'gmail'],
    expectNotContain: [],
  },
  {
    name: 'Contact – phone',
    message: "How can I call or phone Swapnil?",
    expectContains: ['(607)2321068', '(607) 232-1068'],
    expectNotContain: [],
  },
  {
    name: 'Social – LinkedIn and GitHub',
    message: "Where can I find Swapnil on LinkedIn or GitHub?",
    expectContains: ['linkedin', 'github', 'SwapnilMane'],
    expectNotContain: [],
  },
  // --- Out-of-context (refusal) ---
  {
    name: 'Out-of-context – favorite movie',
    message: "What is Swapnil's favorite movie?",
    expectContains: [],
    expectNotContain: ['Inception', 'Matrix', 'Star Wars'],
    expectRefuse: true,
  },
  {
    name: 'Out-of-context – salary',
    message: "What is Swapnil's salary or compensation?",
    expectContains: [],
    expectNotContain: ['$200k', '150k', 'salary is'],
    expectRefuse: true,
  },
];

async function chat(message) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  const data = await res.json();
  let reply = (data.reply || '').toLowerCase();
  // Normalize Unicode hyphens/dashes to ASCII so "tf‑idf" / "state‑of‑health" match "tf-idf" / "state-of-health"
  reply = reply.replace(/\u2011|\u2013|\u2014|\u2212/g, '-');
  return reply;
}

/** expectContainsAny: array of groups; at least one phrase from each group must appear (e.g. [['binghamton','sunyb']]) */
function check(reply, tc) {
  const issues = [];
  for (const s of tc.expectContains || []) {
    if (!reply.includes(s.toLowerCase())) issues.push(`Missing expected: "${s}"`);
  }
  for (const group of tc.expectContainsAny || []) {
    const found = group.some((s) => reply.includes(String(s).toLowerCase()));
    if (!found) issues.push(`Missing one of: [${group.join(', ')}]`);
  }
  for (const s of tc.expectNotContain || []) {
    if (reply.includes(s.toLowerCase())) issues.push(`Forbidden found: "${s}"`);
  }
  if (tc.expectRefuse) {
    const refusePhrases = ["don't have", "don't know", "not in", "not have", "no information", "context"];
    const hasRefuse = refusePhrases.some((p) => reply.includes(p));
    if (!hasRefuse) issues.push('Expected a refusal (e.g. "I don\'t have that information")');
  }
  return issues;
}

async function main() {
  console.log('RAG pipeline accuracy test');
  console.log('API base:', BASE);
  console.log('Knowledge: portfolio/backend/data/knowledge.json');
  console.log('');

  let passed = 0;
  let failed = 0;
  const latencies = [];
  let totalExpectedPhrases = 0;
  let foundExpectedPhrases = 0;
  let totalForbiddenPhrases = 0;
  let forbiddenViolations = 0;

  for (const tc of TEST_CASES) {
    process.stdout.write(`  ${tc.name} ... `);
    try {
      const start = performance.now();
      const reply = await chat(tc.message);
      const elapsed = performance.now() - start;
      latencies.push(elapsed);

      const issues = check(reply, tc);

      // Count expected phrase hits (for metrics)
      for (const s of tc.expectContains || []) {
        totalExpectedPhrases++;
        if (reply.includes(s.toLowerCase())) foundExpectedPhrases++;
      }
      for (const group of tc.expectContainsAny || []) {
        totalExpectedPhrases++;
        if (group.some((s) => reply.includes(String(s).toLowerCase()))) foundExpectedPhrases++;
      }
      for (const s of tc.expectNotContain || []) {
        totalForbiddenPhrases++;
        if (reply.includes(s.toLowerCase())) forbiddenViolations++;
      }

      if (issues.length === 0) {
        console.log(`PASS (${elapsed.toFixed(0)}ms)`);
        passed++;
      } else {
        console.log(`FAIL (${elapsed.toFixed(0)}ms)`);
        issues.forEach((i) => console.log('    -', i));
        console.log('    Reply snippet:', reply.slice(0, 120) + '...');
        failed++;
      }
    } catch (e) {
      console.log('ERROR:', e.message);
      failed++;
    }
  }

  const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
  const passRate = TEST_CASES.length ? (100 * passed) / TEST_CASES.length : 0;
  const totalPhraseChecks = totalExpectedPhrases + totalForbiddenPhrases;
  const correctPhraseChecks = foundExpectedPhrases + (totalForbiddenPhrases - forbiddenViolations);
  const precision = totalPhraseChecks ? (100 * correctPhraseChecks) / totalPhraseChecks : 100;
  const expectedRecall = totalExpectedPhrases ? (100 * foundExpectedPhrases) / totalExpectedPhrases : 100;
  const forbiddenAvoided = totalForbiddenPhrases
    ? 100 - (100 * forbiddenViolations) / totalForbiddenPhrases
    : 100;
  const recall = expectedRecall;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  console.log('');
  console.log('--- RAG validation metrics ---');
  console.log(`  Pass rate:        ${passed}/${TEST_CASES.length} (${passRate.toFixed(1)}%)`);
  console.log(`  Avg latency:      ${avgLatency.toFixed(0)} ms`);
  console.log(`  Precision:        ${correctPhraseChecks}/${totalPhraseChecks} checks correct (${precision.toFixed(1)}%)`);
  console.log(`  Recall:           ${foundExpectedPhrases}/${totalExpectedPhrases} expected phrases found (${recall.toFixed(1)}%)`);
  console.log(`  F1:               ${f1.toFixed(1)}%`);
  console.log(`  Forbidden phrases: ${forbiddenViolations} violations of ${totalForbiddenPhrases} (${forbiddenAvoided.toFixed(1)}% avoided)`);
  console.log('-------------------------------');
  console.log('');
  console.log(`Result: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
