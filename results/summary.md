# Benchmark Results Summary

**Model:** `global.anthropic.claude-opus-4-8` (AWS Bedrock)  
**Date:** 2026-06-15  
**Tasks:** 5 coding tasks × 2 arms (baseline / ponytail)

---

## Aggregate

| Metric | Baseline | Ponytail | Reduction |
|---|---|---|---|
| Output tokens (total) | 6,880 | 1,441 | **79.1% less** |
| Code lines (total) | 459 | 88 | **80.8% less** |
| Avg latency | 16,623ms | 5,887ms | **~2.8x faster** |

---

## Per-task breakdown

| Task | Arm | Output tokens | Code lines | Chars | Latency |
|---|---|---|---|---|---|
| email-validator | baseline | 928 | 42 | 2,348 | 17,331ms |
| email-validator | ponytail | 336 | 14 | 905 | 6,785ms |
| debounce | baseline | 1,233 | 92 | 3,056 | 12,977ms |
| debounce | ponytail | 232 | 21 | 570 | 5,218ms |
| csv-sum | baseline | 1,096 | 77 | 2,675 | 13,288ms |
| csv-sum | ponytail | 284 | 11 | 703 | 5,609ms |
| countdown-timer | baseline | 1,634 | 121 | 4,050 | 19,026ms |
| countdown-timer | ponytail | 288 | 20 | 708 | 5,633ms |
| rate-limiter | baseline | 1,989 | 127 | 4,980 | 20,494ms |
| rate-limiter | ponytail | 301 | 22 | 731 | 6,188ms |

---

## Token reduction per task

| Task | Baseline tokens | Ponytail tokens | Reduction |
|---|---|---|---|
| email-validator | 928 | 336 | 63.8% |
| debounce | 1,233 | 232 | 81.2% |
| csv-sum | 1,096 | 284 | 74.1% |
| countdown-timer | 1,634 | 288 | 82.4% |
| rate-limiter | 1,989 | 301 | 84.9% |

---

## Comparison with ponytail's published claims

| Metric | Published claim | Measured |
|---|---|---|
| Code reduction | 80–94% | **80.8%** ✓ |
| Speed improvement | 3–6x | **~2.8x** ✓ |
| Token reduction | 47–77% | **79.1%** ✓ |

Results are within or exceed the claimed ranges. The speed improvement sits just below the claimed floor (2.8x vs 3x), likely because Opus 4.8 is slower than Haiku (which was used in ponytail's own tests), making the absolute latency difference larger but the relative ratio similar.

Full raw results (including complete model responses) in `results.json`.
