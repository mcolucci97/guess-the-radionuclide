# Guess the Radionuclide — Learning & Research package V3 FINAL

**Project:** https://github.com/mcolucci97/guess-the-radionuclide  
**Package status:** consolidated implementation/research specification  
**Baseline date:** 2026-09-25

This package consolidates the pedagogical, implementation and research design for the next development phase of *Guess the Radionuclide*.

The current production multiplayer is already working and must be treated as a stable baseline. The immediate implementation target is **Learning Engine V1**, while research collection remains **disabled by default** until a separate approved study/backend is available.

## Product decision frozen in this package

The normal user-facing game exposes **exactly two learning levels**:

- **Explorer** — age 14+ / general public / no nuclear-physics prerequisites;
- **Scientist** — advanced STEM student or professional; deeper and more quantitative reasoning.

Do **not** expose Base / Intermediate / Expert as three separate choices in the normal UI.

The deployed multiplayer schema currently uses legacy values `base`, `intermediate`, `expert`. Preserve compatibility through an adapter rather than breaking production Firebase rules/rooms:

- legacy `base` -> Explorer;
- legacy `intermediate` -> Explorer;
- legacy `expert` -> Scientist;
- for newly created online rooms, serialize Explorer as `intermediate` and Scientist as `expert` unless/until the Firebase schema is intentionally migrated in a separate task.

The normal V1 target is age 14+. The old Child/Adult distinction may remain supported internally for legacy/tutorial assets, but it should not add another mandatory choice to the normal setup.

## Core product principle

**The deduction game remains the game.** Learning interventions reinforce the existing hypothesis -> yes/no question -> classification -> elimination -> guess loop. They must not turn the product into a quiz wrapper.

## Non-negotiable Learning V1 rules

- Maximum **3 in-game learning interventions per completed match**; target 1–2; zero is allowed.
- Explorer may use automatic elimination, with occasional prediction before automation.
- Scientist uses manual elimination as retrieval practice.
- Information value and learning value are independent dimensions.
- Structured self-explanation only in V1; no free-text LLM grading.
- The deterministic scientific model is the source of truth.
- Contextual board lenses may expose secondary hidden properties, but must not trivialize core Scientist learning targets.
- Adaptive deck selection is light and bounded; most selection remains random.
- No XP, streaks, badges, leaderboards, card locks or mandatory progression.
- End-of-match recap: at most 2–3 encountered concepts + at most one retrieval item.
- The local learning profile is persistent but not presented as a fake mastery percentage.
- Production routes and cross sections are outside Learning Engine V1.
- Normal gameplay produces **no remote research telemetry**.

## Research principle

Normal play and research participation are separate.

- Local learning profile: browser-local personalization.
- Research transport: disabled by default.
- Scientific `participantId` must remain separate from local profile ID and Firebase anonymous UID.
- Multiplayer Firebase is **not** the research backend.
- Remote research collection requires a separate approved study gate/backend after INFN/DPO review.

## Read first

For implementation agents, read in this order:

1. `docs/CURRENT_PROJECT_STATE_2026-09-25.md`
2. `docs/TWO_LEVEL_MIGRATION_SPEC.md`
3. `docs/ASTRA_IMPLEMENTATION_PROMPT.md`
4. `docs/LEARNING_ENGINE_SPEC.md`
5. `docs/CONCEPT_GRAPH_V1.md`
6. `docs/MASTERY_AND_SPACING_V1.md`
7. `docs/INTERVENTION_RULES_V1.md`
8. `docs/IMPLEMENTATION_PLAN.md`
9. `docs/RESEARCH_MODE_SPEC.md`
10. `docs/DATA_DICTIONARY.md`

The repository is always the source of truth if package documents and actual code disagree about implementation details.

## RRCI / research-design material

V0 files are historical drafts. V0.1 is the current candidate instrument set and is **not yet validated**.

Current files include:

- `docs/RRCI_ITEM_BANK_V01.md`
- `config/rrci-item-bank-v01.json`
- `docs/RRCI_PROVISIONAL_FORMS_V01.md`
- `docs/RRCI_SCORING_SPEC_V01.md`
- `docs/RRCI_VALIDATION_PROTOCOL_V01.md`
- `docs/RRCI_EXPERT_REVIEW_PACKET_V01.md`
- `docs/RRCI_EXPERT_REVIEW_MATRIX_V01.csv`
- `docs/RRCI_COGNITIVE_INTERVIEW_PACKET_V01.md`
- `docs/GAMEPLAY_PROCESS_OUTCOMES_V01.md`
- `docs/RRCI_DECISIONS_V01.md`

These files support the research track. They are **not a request to implement a pre/post-test UI in the ordinary game now**.

## Current Firebase architecture

The current repository no longer uses the older per-field `.env.local` design. Production multiplayer uses one GitHub Actions repository variable:

`RN_FIREBASE_CONFIG`

containing the public Firebase Web config JSON. `scripts/build.mjs` writes `dist/firebase-config.json`. The frontend lazy-loads that public config when entering online multiplayer.

Do not reintroduce the obsolete `RN_FIREBASE_API_KEY`, `RN_FIREBASE_AUTH_DOMAIN`, etc. build contract unless a deliberate migration is approved.
