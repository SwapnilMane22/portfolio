/**
 * Accuracy test for the RAG chatbot.
 * Run with backend up: node scripts/test-accuracy.js
 * Uses TEST_CASES: each question is sent to /api/chat; reply is checked for expected/forbidden strings.
 */
const BASE = process.env.CHAT_API_BASE || 'http://localhost:5000';

const TEST_CASES = [
  {
    name: 'Skills question',
    message: "What are Swapnil's skills?",
    expectContains: ['Python', 'Machine Learning'],
    expectNotContain: ['Swift', 'Angular'],
  },
  {
    name: 'Education',
    message: "Where did Swapnil study? What degree?",
    expectContains: ['Binghamton', 'Computer Science', 'Master', '3.71'],
    expectNotContain: ['PhD'],
  },
  {
    name: 'Project exists',
    message: "Does Swapnil have a project about battery or SOH?",
    expectContains: ['battery', 'SOH', '90'],
    expectNotContain: [],
  },
  {
    name: 'Contact',
    message: "What is the contact email?",
    expectContains: ['smane', 'bing'],
    expectNotContain: [],
  },
  {
    name: 'Out-of-context (should not hallucinate)',
    message: "What is Swapnil's favorite movie?",
    expectContains: [], // no required phrase
    expectNotContain: ['Inception', 'Matrix', 'Star Wars'],
    expectRefuse: true, // should say don't have / not in context
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
  return (data.reply || '').toLowerCase();
}

function check(reply, tc) {
  const issues = [];
  for (const s of tc.expectContains || []) {
    if (!reply.includes(s.toLowerCase())) issues.push(`Missing expected: "${s}"`);
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
  console.log('Chatbot accuracy test');
  console.log('API base:', BASE);
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    process.stdout.write(`  ${tc.name} ... `);
    try {
      const reply = await chat(tc.message);
      const issues = check(reply, tc);
      if (issues.length === 0) {
        console.log('PASS');
        passed++;
      } else {
        console.log('FAIL');
        issues.forEach((i) => console.log('    -', i));
        console.log('    Reply snippet:', reply.slice(0, 120) + '...');
        failed++;
      }
    } catch (e) {
      console.log('ERROR:', e.message);
      failed++;
    }
  }

  console.log('');
  console.log(`Result: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
