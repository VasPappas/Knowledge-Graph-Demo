# Knowledge Atlas — public demo v0.3

Live: https://vaspappas.github.io/Knowledge-Graph-Demo/

A browser-only, read-only atlas. Visitors need no installation, account, model service, database server or API key. The main research repository remains private.

## Explore the release

- **Atlas / Graph:** eight editorial regions and four small collections. Society now opens Government & participation → Democracy.
- **Democracy:** 10 document/proposition nodes and six bounded documentary attributions, each with an exact passage locator, edition, historical date, addressed population, source link, attestation and assessment.
- **Sources:** four source records. Three of the six statements share the UDHR source; six attestations do not mean six independent sources.
- **Relations:** 14 binary definitions and seven structured patterns. The original seed yields 18 candidate binary mappings and 10 held mappings. Missing roles and context are visible, not silently invented.

The combined graph contains **43 nodes and 34 statements**. All original 33 nodes, 28 statements, status labels, stable IDs and illustrative history remain unchanged. Original `data/knowledge.mjs`, `data/atlas.json`, `assets/core.mjs`, prior app modules and tests remain in the repository. The v0.3 app creates a separate read-only projection.

## Public review preview, not verified knowledge

The owner requested publication to the demo. `data/release-v0.3.json` records this later authorization, limited to six allowlisted entries and the registry. The original staged snapshots retain their earlier `publication_allowed: false` values and review status. Preview authorization is not independent verification or approval for publication as established knowledge.

The six new statements say **a specified document states a specified proposition**. They do not establish practical implementation, present legal effect, a regime classification, or a political recommendation. They are narrow paraphrases, not quotations or a representative account of political traditions worldwide. Each remains **AI text checked; independent review pending**. Reinspection by the same assistant is not independent review. Source snapshots have not been archived.

The original 28 seed statements still lack checked passage-level support. The Parker/bebop correction sequence is a scripted illustration; its synthetic dates are explicitly labelled. No assessment dates are invented for other seed statements.

## Data and interface

- `data/knowledge.mjs`: unchanged, frozen legacy seed records.
- `data/atlas.json`: unchanged v0.2 editorial atlas; the release supplies an additive extension.
- `data/registry-v0.1.json`: exact staged registry snapshot.
- `data/democracy-batch-001.json`: exact staged documentary snapshot, including all qualifiers, attestations and assessments.
- `data/release-v0.3.json`: preview authorization, allowlist, pinned source hashes and Society journey.
- `assets/live-data-v03.mjs`: validation and read-only projection; no fact promotion, inference or editing.
- `assets/live-v03.mjs` and `assets/live-v03.css`: current interface.
- `tests/live-v03.test.mjs`, `tests/browser_v03.py`: new regression and browser-fixture checks.

Visual families are not inference rules. Browsing backward along an edge does not reverse the assertion. No new edges are created by atlas placement, paths, aliases or shared vocabulary.

## Deployment and test scope

GitHub Pages continues to serve **main / (root)**. No build step or external runtime dependency was added. See `TESTING.md` for the executed checks and their limits.

The unsourced Democracy brainstorm, private audit/agent files, autonomous ingestion, authenticated editing, AI narration and unimplemented visual mockups are not published as working features. This release does not merge the private review branch or change repository visibility.
