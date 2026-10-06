# Knowledge Atlas — public demo v0.4

Live: https://vaspappas.github.io/Knowledge-Graph-Demo/

A browser-only, read-only atlas. Visitors need no installation, account, model service, database server or API key. The main research repository remains private.

## Explore the release

- **Atlas / Graph:** eight editorial regions and five small collections.
- **Mathematics:** Formal Systems → Mathematics → Prime numbers & proof.
- **Proof Explorer:** the same infinitude-of-primes proposition is reached by an Euclid-style finite construction and an Euler-style analytic route, with distinct dependency paths.
- **Mathematical status:** proved, open, refuted and proved-under-explicit-hypotheses cases are represented as proposition assessments rather than primitive Theorem/Conjecture node types.
- **Democracy:** the six source-linked documentary attributions from v0.3 remain available.
- **Sources:** 16 public-review source records: 4 Democracy and 12 Mathematics.
- **Relations:** the general relation registry remains visible, with five additional Mathematics proof/formalization/status semantics.

The combined projection contains **67 nodes and 46 displayed statements**. All original 33 nodes, 28 statements, stable IDs and illustrative history remain unchanged.

## Mathematics is a review preview, not a proof certificate

The project owner explicitly requested the Mathematics build be added to the Atlas. `data/release-v0.4.json` records that display authorization separately from the original staged Mathematics snapshots.

Those snapshots still say `publication_allowed: false` and retain pending independent mathematical review. Public display does not turn them into independently verified findings.

The current Mathematics pilot contains:

- 24 Mathematics nodes;
- 12 displayed Mathematics statements;
- 12 source records;
- 3 Proof records;
- 4 proposition-status assessments;
- 2 definition records;
- 3 formalization records;
- 1 explicit counterexample record.

Important distinctions remain visible:

- proposition ≠ proof;
- proof ≠ source containing or describing the proof;
- formal theorem artifact ≠ independent historical proof;
- computational checking ≠ proof of a universal claim;
- historical definition ≠ automatically equivalent modern definition;
- two proofs of one proposition ≠ two propositions;
- different proof paths ≠ a formal theorem of proof independence.

Mathlib documentation was inspected but was **not locally recompiled or independently audited**. Source snapshots are not archived.

## Self-correction demonstrated structurally

During the Mathematics stress test an intermediate record treated a formal theorem artifact as though it were a document under `R_DOCUMENT_STATES`. The relation typing rejected that design, and the row was removed before release. Formalization and documentary attribution remain separate structures.

The refuted proposition “every prime natural number is odd” is also preserved rather than deleted: the counterexample record identifies 2 as the witness, while the original proposition remains inspectable with status `refuted`.

## Validation

The v0.4 pull-request validation ran on GitHub Actions using Node 20:

- v0.4 module syntax checks: **passed**;
- Node regression tests across v0.2/v0.3/v0.4: **82 passed, 0 failed**.

The v0.4 suite verifies exact staged Mathematics blob hashes, counts, atlas ancestry, proposition statuses, proof comparison, counterexample preservation, blocked fact promotion, publication guards, disconnected-domain behavior and previous release invariants.

**Browser automation was not rerun for v0.4.** The earlier v0.3 release had 31 controlled in-memory Chromium scenario groups, but those are not evidence that the new Mathematics UI has been live-browser tested. GitHub Pages deployment status is checked separately after publication.

See `TESTING.md` for the boundary.

## Public data

- `data/knowledge.mjs`: unchanged legacy seed.
- `data/atlas.json`: unchanged v0.2 base atlas; releases add read-only extensions.
- `data/democracy-batch-001.json`: exact v0.3 Democracy snapshot.
- `data/registry-v0.1.json`: relation registry snapshot.
- `data/mathematics-batch-001.json`: definitions, Euclid IX.20, Mathlib formalization, Riemann hypothesis.
- `data/mathematics-batch-002.json`: counterexample and Euclid's lemma stress cases.
- `data/mathematics-batch-003.json`: second proof path for infinitude of primes.
- `data/mathematics-semantics-v0.1.json`: proof/status/formalization semantics.
- `data/release-v0.4.json`: display authorization and Mathematics Atlas mapping.

## Still not implemented

Autonomous ingestion, scholarly verification, authenticated editing, local Lean replay, source snapshot archiving, proof-term inspection, global historical snapshots and unrestricted AI-generated prose remain outside this static release.
