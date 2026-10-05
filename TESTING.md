# v0.3 testing record

Recorded 5 October 2026. Tests were executed in a disposable assistant environment before the public branch update.

## Core and contract tests

From the repository root:

```sh
node --test tests/*.test.mjs
```

**56 passed; 0 failed**: the original 20 tests plus 36 new cases. The old tests use the unchanged original atlas and seed; the new tests use the combined release projection.

Coverage includes exact Git blob hashes for the original seed and staged registry/batch, 43 nodes and 34 statements, original record identity and history preservation, eight regions/four journeys, all previous Love lenses, 18 candidate mappings/10 held mappings, all six source chains, scope and edition matching, allowlist enforcement, required preview authorization, blocked inference and status promotion, malformed references, unsafe source URLs, directed/browsing paths, and immutable input records.

## Browser interactions

```sh
python tests/browser_v03.py
```

**31 scenario groups passed; 0 failed**, in Chromium at 1440 × 1100 and 390 × 844. Groups include repeated checks of all six documentary statements and four mobile views.

Coverage includes Society navigation, source links and PDF page anchors, historical scope and population, the 1919 proposal context, four sources, registry definitions and held filters, all 43 graph nodes/34 edges, old journeys and semantic paths, Love identity, scripted history, new keyword retrieval, keyboard access, safe search/unknown routes, deep links, mobile overflow and uncaught JavaScript errors.

### Important limitation

This environment blocks browser network navigation. These checks load **our own files in memory**, remove module import/export declarations only inside the test fixture, and supply our JSON files through a controlled fetch stub. No browser policy or security setting was changed.

They are interaction/rendering checks, **not** live GitHub Pages end-to-end tests, HTTP transport checks, native network ESM-loader tests or independent scholarly review. Deployment status must be checked separately in GitHub Actions. Do not interpret a deployment success as proof that every live browser interaction was tested.

The script uses Python Playwright and Chromium. `CHROMIUM` selects the executable; `TEST_OUTPUT` selects the screenshots/results directory. These are maintainer tools, not visitor requirements. `tests/browser_test.py` is the prior v0.2 fixture and is retained as history; use `browser_v03.py` for this release.

## Source inspection is separate

The six paraphrases were re-inspected by the same assistant against Refworld's UDHR PDF page 4 and the three linked National Archives transcriptions. The review scope is document content only. No independent review, legal-effect assessment or historical-implementation finding is claimed. Full source snapshots are not archived.

## Manual live smoke check

Open the normal site and look for **EXPLORER / 0.3**. Follow Society → Government & participation → Democracy. Open an edge, check its source link and pending-review label, then inspect Sources and Relations. Original Nature/Culture/Mind routes remain available. No GitHub settings or local installation is required.
