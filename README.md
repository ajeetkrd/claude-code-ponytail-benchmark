# Ponytail Plugin — Benchmark & Validation

This repo benchmarks the [ponytail plugin](https://github.com/DietrichGebert/ponytail) for Claude Code.

Ponytail injects a "lazy senior developer" system prompt that enforces minimal code output via a 6-step decision tree. The plugin claims 80–94% less code, 3–6x faster responses, and 47–77% cheaper token usage.

---

## Results (Claude Opus 4.8 via AWS Bedrock)

| Metric | Baseline | Ponytail | Reduction |
|---|---|---|---|
| Output tokens | 6,880 | 1,441 | **79.1% less** |
| Code lines | 459 | 88 | **80.8% less** |
| Avg latency | 16,623ms | 5,887ms | **~2.8x faster** |

5 tasks × 2 arms (baseline + ponytail). Full per-task data in [`results/results.json`](results/results.json) and [`results/summary.md`](results/summary.md).

**Verdict:** ~80% token and code reduction, ~3x speed improvement on Opus 4.8.

---

## What's in this repo

```
benchmark.mjs          # Benchmark script (AWS Bedrock, no API key needed)
package.json           # Dependencies: @anthropic-ai/bedrock-sdk
results/
  results.json         # Raw per-task results
  summary.md           # Human-readable results table
INSTALL.md             # How to install the ponytail plugin into Claude Code
```

---

## Running the benchmark yourself

### Prerequisites

- Node.js 18+
- AWS credentials configured (`~/.aws/credentials` or env vars) with Bedrock access
- The `anthropic.claude-opus-4-8` inference profile enabled in your AWS account

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Run the benchmark (~5 minutes, makes 10 API calls)
node benchmark.mjs

# 3. Results printed to stdout and saved to results.json
```

To use a different model, edit the `MODEL` constant in `benchmark.mjs`. Run `aws bedrock list-inference-profiles` to find available profile IDs in your account.

---

## How it works

The benchmark sends 5 identical coding tasks to Claude twice each:

- **Baseline arm**: no system prompt — plain Claude
- **Ponytail arm**: ponytail's AGENTS.md system prompt injected

Tasks are the same 5 used in ponytail's own published benchmarks:
1. Email address validator
2. Debounce function
3. CSV column summer (Node.js script)
4. Browser countdown timer
5. Rate limiter (N calls/sec)

Metrics recorded per task: input tokens, output tokens, code lines (non-blank/non-comment), character count, latency ms.
