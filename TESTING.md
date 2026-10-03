# v0.2 testing record

## Scope

The files were tested in a disposable assistant execution environment before publication. The site itself is static and needs no installation for visitors.

### Core tests

`node --test tests/core.test.mjs`

20 tests passed, covering: record counts and IDs, valid references, eight regions and three primary journeys, complete navigation paths, shared Love identity across three lenses, empty regions, deduplicated coverage, non-mutating projections, forward and reverse traversal, disconnected and same-node paths, retrieval without generation, explicit-only history, illustrative-date preservation, audit status, frozen records, and invalid/cyclic data rejection.

### Browser interaction checks

`python tests/browser_test.py`

18 scenarios passed in Chromium at desktop (1440 × 1100) and mobile (390 × 844) viewport sizes. They cover region navigation, empty coverage, all three main journeys, evidence inspection, breadcrumbs and back navigation, illustrative history, shared identities, a fresh-document deep link, path modes, retrieval, keyboard access, disconnected records, concept search, safe unknown routes, mobile overflow, and absence of runtime JavaScript errors.

**Important limitation:** this execution environment blocks browser network navigation. The checks load our own HTML/CSS/JavaScript files in memory, remove ESM import/export syntax for the fixture, and supply the local atlas JSON through a controlled fetch stub. No browser policies are modified. These are interaction/rendering checks, **not live GitHub Pages end-to-end verification**, real-network ESM-loader tests, or a scholarly review.

The script requires Python Playwright and an available Chromium executable. Set `CHROMIUM` to the executable path and `TEST_OUTPUT` for optional screenshots/results. Neither is required by site visitors.

## Manual live smoke check after deployment

Open the normal site URL. Verify the v0.2 badge, follow Nature → Physics → Gravitation, inspect an edge, return via a breadcrumb, then reach Love through both the Mind and Literature views. No setting changes or local installations are necessary.
