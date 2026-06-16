/**
 * Ponytail Benchmark
 *
 * Sends identical coding tasks to Claude twice:
 *   - BASELINE: no special instructions
 *   - PONYTAIL: ponytail system prompt injected
 *
 * Measures per-task and aggregate:
 *   - Input / output tokens (from API usage field)
 *   - Lines of code in response (non-blank, non-comment)
 *   - Total characters in response
 *   - Latency (ms)
 *
 * Uses AWS Bedrock with the default credential chain (env vars, ~/.aws/credentials, IAM role).
 * Run:  node benchmark.mjs
 */

import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import { writeFileSync } from "fs";

// Resolves credentials via the standard AWS chain:
// AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY env vars → ~/.aws/credentials → instance metadata
const client = new AnthropicBedrock();

// ── Ponytail system prompt (from AGENTS.md) ────────────────────────────────
const PONYTAIL_SYSTEM = `
You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:
1. Does this need to be built at all? (YAGNI)
2. Does the standard library already do this? Use it.
3. Does a native platform feature cover it? Use it.
4. Does an already-installed dependency solve it? Use it.
5. Can this be one line? Make it one line.
6. Only then: write the minimum code that works.

Rules:
- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Mark intentional simplifications with a ponytail: comment.
`.trim();

// ── Tasks (same as ponytail benchmark tasks) ──────────────────────────────
const TASKS = [
  {
    id: "email-validator",
    prompt:
      "Write a JavaScript function that validates an email address. Return true if valid, false if not.",
  },
  {
    id: "debounce",
    prompt:
      "Write a JavaScript debounce function that delays invoking a function until after `wait` ms have elapsed since the last call.",
  },
  {
    id: "csv-sum",
    prompt:
      "Write a Node.js script that reads a CSV file (first argument), sums all numbers in the second column, and prints the total.",
  },
  {
    id: "countdown-timer",
    prompt:
      "Write a browser-based countdown timer. User enters seconds, clicks Start, and sees countdown to 0 with a done alert.",
  },
  {
    id: "rate-limiter",
    prompt:
      "Write a JavaScript rate limiter that allows at most N calls per second to a given async function.",
  },
];

// Bedrock model IDs use the "anthropic." prefix
const MODEL = "global.anthropic.claude-opus-4-8";

function countCodeLines(text) {
  return text
    .split("\n")
    .filter((l) => {
      const t = l.trim();
      return t.length > 0 && !t.startsWith("//") && !t.startsWith("#") && !t.startsWith("*") && !t.startsWith("/*");
    }).length;
}

async function runTask(task, arm) {
  const messages = [{ role: "user", content: task.prompt }];
  const opts = {
    model: MODEL,
    max_tokens: 2048,
    messages,
  };
  if (arm === "ponytail") {
    opts.system = PONYTAIL_SYSTEM;
  }

  const t0 = Date.now();
  const response = await client.messages.create(opts);
  const latencyMs = Date.now() - t0;

  const text = response.content.map((b) => b.text).join("");
  return {
    arm,
    taskId: task.id,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    codeLines: countCodeLines(text),
    chars: text.length,
    latencyMs,
    response: text,
  };
}

async function main() {
  console.log(`Model: ${MODEL}`);
  console.log(`Tasks: ${TASKS.length}`);
  console.log(`Arms:  baseline, ponytail\n`);
  console.log("─".repeat(72));

  const results = [];

  for (const task of TASKS) {
    for (const arm of ["baseline", "ponytail"]) {
      process.stdout.write(`  ${arm.padEnd(10)} ${task.id.padEnd(20)}`);
      const r = await runTask(task, arm);
      results.push(r);
      console.log(
        `  out_tokens=${String(r.outputTokens).padStart(5)}  code_lines=${String(r.codeLines).padStart(4)}  chars=${String(r.chars).padStart(5)}  ${r.latencyMs}ms`
      );
    }
    console.log();
  }

  // ── Aggregate summary ────────────────────────────────────────────────────
  console.log("─".repeat(72));
  console.log("\nSUMMARY (totals across all tasks)\n");

  for (const arm of ["baseline", "ponytail"]) {
    const rows = results.filter((r) => r.arm === arm);
    const totTokens = rows.reduce((s, r) => s + r.outputTokens, 0);
    const totLines = rows.reduce((s, r) => s + r.codeLines, 0);
    const totChars = rows.reduce((s, r) => s + r.chars, 0);
    const avgLatency = Math.round(rows.reduce((s, r) => s + r.latencyMs, 0) / rows.length);
    console.log(`  ${arm}`);
    console.log(`    Output tokens : ${totTokens}`);
    console.log(`    Code lines    : ${totLines}`);
    console.log(`    Chars         : ${totChars}`);
    console.log(`    Avg latency   : ${avgLatency}ms`);
    console.log();
  }

  const base = results.filter((r) => r.arm === "baseline");
  const pony = results.filter((r) => r.arm === "ponytail");

  const pct = (b, p) => (((b - p) / b) * 100).toFixed(1);

  const bTokens = base.reduce((s, r) => s + r.outputTokens, 0);
  const pTokens = pony.reduce((s, r) => s + r.outputTokens, 0);
  const bLines = base.reduce((s, r) => s + r.codeLines, 0);
  const pLines = pony.reduce((s, r) => s + r.codeLines, 0);

  console.log("REDUCTIONS (ponytail vs baseline)");
  console.log(`  Output tokens : ${pct(bTokens, pTokens)}% less`);
  console.log(`  Code lines    : ${pct(bLines, pLines)}% less`);

  // ── Save full results ────────────────────────────────────────────────────
  const out = {
    model: MODEL,
    results,
    summary: {
      baseline: {
        outputTokens: bTokens,
        codeLines: bLines,
      },
      ponytail: {
        outputTokens: pTokens,
        codeLines: pLines,
      },
      reductions: {
        outputTokensPct: pct(bTokens, pTokens),
        codeLinesPct: pct(bLines, pLines),
      },
    },
  };

  writeFileSync("results.json", JSON.stringify(out, null, 2));
  console.log("\nFull results saved to results.json");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
