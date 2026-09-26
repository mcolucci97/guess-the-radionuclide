# Learning Engine V1 implementation plan

## Baseline rule

The existing production multiplayer is working. Extend the repository; do not restart or redesign it.

## Phase 0 — establish source of truth

Before writing code:
- inspect current `main`;
- inspect current tests/build scripts;
- inspect `src/App.js`, `src/engine/`, `src/multiplayer/`;
- rerun baseline tests;
- document any current failures without hiding them.

Create a dedicated feature branch, preferably `feature/learning-engine-v1`.

## Phase 1 — simplify user-facing levels

Implement the two-level adapter described in `TWO_LEVEL_MIGRATION_SPEC.md`.

Normal setup shows only Explorer / Scientist for content/learning depth.

Do not migrate production Firebase rules in this phase. Preserve serialized online compatibility.

## Phase 2 — semantic gameplay event contract

Add a reusable local event interface with no visible behavior change.

Required events:
- `MATCH_STARTED`
- `QUESTION_ASKED`
- `ANSWER_RECEIVED`
- `CARDS_SELECTED_FOR_ELIMINATION`
- `CARDS_ELIMINATED`
- `GUESS_MADE`
- `MATCH_FINISHED`

Ensure solo, local and online can produce equivalent semantic evidence.

## Phase 3 — local profile and evidence model

Create `src/learning/` modules for:
- event definitions;
- concept taxonomy/mapping;
- evidence updates;
- local profile persistence;
- scheduler/review priority;
- intervention budget;
- question information value;
- intervention selection;
- recap/retrieval;
- research transport abstraction.

Use IndexedDB where practical with a testable storage abstraction and safe local fallback.

## Phase 4 — Explorer interventions

Add:
- occasional prediction before automatic elimination;
- concise deterministic feedback;
- optional self-explanation;
- qualitative question-quality feedback;
- contextual lens only for secondary/supporting properties.

Respect max 3 in-game interventions/match.

## Phase 5 — Scientist interventions

Scientist defaults to manual elimination.

Add:
- capture of manual classification evidence;
- delayed deterministic inconsistency feedback;
- faded/less explicit scaffolding;
- Scientist-only deeper concept mappings.

Do not redundantly use Explorer prediction.

## Phase 6 — recap and spacing

Implement:
- 2–3 concept recap;
- at most one retrieval item;
- explicit-information cooldown;
- review priority based on elapsed time and evidence.

## Phase 7 — light adaptive deck

Keep most selection random.

Bound adaptation toward:
- review-due concepts;
- repeated mistakes;
- anchor radionuclides.

Never personalize the two players' online deck independently.

## Phase 8 — research-ready but disabled

Implement only:
- `DisabledResearchTransport` as default;
- `InMemoryResearchTransport` for tests;
- clean interface for future approved backend.

Do not create a research Firebase schema or remote logger now.

## Testing

Add deterministic unit tests for:
- two-level mapping and legacy compatibility;
- concept mapping;
- evidence strengths;
- exposure != mastery;
- information-value classification;
- independent learning value;
- intervention budget and priority;
- cooldown and misconception override;
- review priority;
- Explorer prediction eligibility;
- Scientist no redundant prediction;
- assisted evidence weaker than independent evidence;
- light adaptive weighting bounds;
- anchor weighting bounds;
- shared online deck fairness;
- persistence abstraction;
- disabled research transport/no normal-play research network activity.

Regression/E2E:
- solo modes;
- local two-player;
- online multiplayer;
- refresh/reconnect;
- existing Firebase rules tests;
- no unexpected LLM download/use.

## Recovery document

Create/update `docs/LEARNING_ENGINE_PROGRESS.md` after each logical checkpoint with:
- branch and commit SHA;
- completed items;
- partial work;
- remaining work;
- test results;
- known limitations.
