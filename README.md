# Knowledge Atlas — public demo v0.2

A browser-only, read-only knowledge atlas. No installation, model service, database server or API key is required for visitors.

Live site: https://vaspappas.github.io/Knowledge-Graph-Demo/

## Start with the big picture

Eight **provisional editorial regions** organize three deliberately small seed collections. Three main journeys are available:

- Nature → Physics → Gravitation
- Culture → Music → Jazz
- Mind → Emotions & relationships → Love

Love also has limited literary and ethical views. Every route opens the **same node `L01`**, not a duplicate. Regions without mapped records say **Not yet populated**; an empty region is not evidence that the world has no knowledge of it.

## What is retained

The 33 seed nodes, 28 statements, stable IDs, original status labels, and explicitly stored Parker/bebop illustrative history remain. The original public HTML is preserved in `archive/v0.1.html` as well as in Git history. It is a legacy artifact, not the current evidence policy.

## Evidence boundary

The original status labels are **seed labels, not independently verified findings**. All statements currently have unverified passage-level support. A source field may name a work or simply say something general such as “Jazz histories”; neither is represented as a verified citation.

The Parker/bebop correction sequence is a **scripted illustration**, not autonomous self-correction or a record of actual research decisions. Its synthetic dates remain accessible under an explicit label. No default assessment dates are manufactured for other statements.

## Files

- `data/knowledge.mjs` — original seed records plus a separate v0.2 audit policy; exports are frozen to discourage accidental mutation.
- `data/atlas.json` — versioned regions, topics, mappings, rationales and curator metadata.
- `assets/core.mjs` — pure validation, projection, search and path functions.
- `assets/app.mjs` / `assets/app.css` — interface and navigation.
- `tests/core.test.mjs` — dependency-free Node regression tests.
- `tests/browser_test.py` — in-memory Chromium interaction tests; no live-network verification.
- `TESTING.md` — test scope and limitations.

Atlas placement never creates knowledge statements. Graph colours retain the original seed-collection labels; they are not exclusive ontology categories. Counts across regions overlap.

## Publishing

GitHub Pages continues to serve **main / (root)**. Visitors do not need to change any settings. There is no build step or external runtime dependency. The main research and development repository remains private; this repository contains only the public static demonstration and its tests.

## Not yet implemented

Autonomous ingestion, scholarly verification, authenticated editing, global historical snapshots, live assessment, and AI-generated prose are not part of this version. Search is keyword retrieval. Browsing a path (including backwards over an edge) does not establish a causal or inferred relationship.
