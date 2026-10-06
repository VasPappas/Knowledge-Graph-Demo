# Atlas testing record

## v0.4 — Mathematics

Recorded 6 October 2026.

### GitHub Actions validation

The pull-request workflow `validate atlas` runs:

```sh
node --check assets/live-data-v04.mjs
node --check assets/live-v04.mjs
node --test tests/*.test.mjs
```

On the v0.4 review branch:

- module syntax checks: **passed**;
- Node tests: **82 passed, 0 failed**.

The 82 tests include all retained v0.2/v0.3 Node tests plus the new Mathematics regression suite.

### v0.4 structural coverage

The actual v0.4 projection model was executed against the staged JSON and produced:

- 67 nodes;
- 46 displayed statements;
- 16 source records;
- 24 Mathematics nodes;
- 12 Mathematics statements;
- 12 Mathematics sources;
- 3 Proof records;
- 4 mathematical proposition-status assessments;
- Formal Systems → Mathematics → Prime numbers & proof;
- 5 Atlas journeys.

The checks verify:

- exact Git blob hashes for the four staged Mathematics snapshots;
- all original seed identities remain unchanged;
- Democracy v0.3 coverage remains intact;
- no primitive `Theorem` or `Conjecture` node type;
- proved, open and refuted proposition-status cases;
- Euclid's lemma retains explicit conditional scope;
- Euclid IX.20 and the Euler-style proof both conclude the same proposition ID;
- the two proof records preserve different dependency sets;
- proof comparison does not enable automatic proof equivalence;
- counterexample target and witness remain explicit;
- every displayed Mathematics statement keeps at least one attestation and the original blocked staging flag;
- Mathematics does not gain an invented graph path to Gravity or Love;
- preview authorization, statement staging, theorem-type promotion and automatic proof-equivalence changes fail closed.

### Browser-test boundary

**v0.4 has not been rerun through the Chromium interaction harness.** The earlier v0.3 release completed 31 controlled in-memory Chromium scenario groups at desktop and mobile viewport sizes. Those v0.3 results are historical and must not be presented as v0.4 browser coverage.

The v0.4 UI has module syntax coverage and model/regression coverage. GitHub Pages deployment is checked separately after the main branch is updated.

## v0.3 — Democracy and relation registry

Recorded 5 October 2026.

- Core/contract Node tests at that release: **56 passed; 0 failed**.
- Controlled Chromium interaction scenario groups: **31 passed; 0 failed**.
- Browser fixture used in-memory project files with a controlled fetch stub; it was not a live GitHub Pages end-to-end test.

## v0.2 — Atlas navigation

- Core tests: **20 passed**.
- Browser scenarios: **18 passed** in desktop and mobile fixtures.

## What tests do not establish

Passing structural or UI tests does not independently verify historical, political or mathematical claims. A deployed page does not turn a staged assessment into verified knowledge. Mathlib documentation inspection is not local proof replay, and agreement between source presentations is not independent mathematical peer review.
