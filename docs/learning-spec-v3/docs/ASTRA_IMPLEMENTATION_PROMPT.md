# MASTER IMPLEMENTATION PROMPT — LEARNING ENGINE V1

Work on the existing repository:

https://github.com/mcolucci97/guess-the-radionuclide

You are resuming an existing project. DO NOT restart it, rewrite it from scratch, or replace its current architecture without a demonstrated need.

The supplied ZIP package is the consolidated **Learning/Research V3 FINAL** design package. Use it as the pedagogical/research specification, but treat the actual repository as the source of truth for current implementation details.

============================================================
0. FIRST: RECONSTRUCT THE REAL CURRENT STATE
============================================================

Before changing code:

1. Inspect the current `main` branch and recent commits.
2. Read the current repository docs, especially multiplayer progress/setup/report files.
3. Inspect:
   - `src/App.js`
   - `src/engine/`
   - `src/multiplayer/`
   - tests
   - build scripts
   - GitHub Pages workflow
   - current Firebase rules/config loading architecture
4. Run the current relevant tests/build and record the baseline.
5. If package docs disagree with the actual repository about implementation details, the repository wins.
6. Do not hide, delete or weaken pre-existing tests/failures.

The online multiplayer is already deployed and has been tested successfully in production by the project owner. Treat multiplayer as a stable baseline.

Create a development branch:

`feature/learning-engine-v1`

If a branch with meaningful Learning Engine work already exists, inspect it first and resume rather than restarting.

============================================================
1. PRIMARY PRODUCT DECISION: EXACTLY TWO USER-FACING LEVELS
============================================================

The normal game must expose exactly TWO learning/content depth choices:

- `explorer`
- `scientist`

Do NOT expose Base / Intermediate / Expert as three normal user-facing choices.

Do NOT add a second separate `learningProfile` selector on top of a content-level selector. Explorer/Scientist is the single normal scientific depth choice.

Normal V1 target: age 14+.

The old Child/Adult distinction may remain supported internally for legacy/tutorial assets, but it should not be another mandatory choice in the standard setup. Default normal play to the existing adult/14+ path. Do not delete child assets merely to simplify the UI.

Preferred normal setup should therefore be simple: game mode + Explorer/Scientist + deck size, with assistance behavior derived from level unless an accessibility/debug override is intentionally retained as a secondary setting.

============================================================
2. LEGACY MULTIPLAYER COMPATIBILITY — DO NOT BREAK PRODUCTION
============================================================

The current deployed multiplayer schema/rules validate legacy values:

- `audience`: `child | adult`
- `level`: `base | intermediate | expert`
- `assist`: `manual | assisted`

Do NOT change production Firebase rules/schema merely to rename these values during Learning V1.

Implement a clean adapter layer.

Required semantic mapping when loading legacy state:

- legacy `base` -> `explorer`
- legacy `intermediate` -> `explorer`
- legacy `expert` -> `scientist`

For newly created online rooms while the legacy Firebase schema remains in production:

- `explorer` -> serialize legacy `intermediate`
- `scientist` -> serialize legacy `expert`

Preferred default assistance:

- Explorer -> `assisted`
- Scientist -> `manual`

Do not independently personalize the two players' online deck or scientific rules.

Keep adapter functions pure, explicit and tested.

============================================================
3. GOAL
============================================================

Implement the first production version of the Learning Engine for *Guess the Radionuclide*.

The game is a deduction/classification game. Learning must improve the player's ability to formulate hypotheses, ask useful yes/no questions, classify radionuclides and eliminate candidates.

Do NOT transform the product into a quiz with a game skin.

Conceptual loop:

hypothesis/question
-> inspect or recall a scientific property
-> classify candidate radionuclides
-> receive evidence
-> update the mental model
-> formulate a better next question

The Learning Engine must be reusable across:
- solo;
- local two-player;
- online multiplayer.

It must be independent of:
- Firebase transport;
- the optional LLM;
- research backend;
- React component internals as much as practical.

============================================================
4. ARCHITECTURE
============================================================

Create a dedicated learning module tree, preferably under:

`src/learning/`

Suggested responsibilities:

- `events.js` — semantic gameplay-event contract
- `levels.js` — Explorer/Scientist + legacy adapters
- `concepts.js` — stable concept IDs and metadata
- `conceptMapping.js` — map structured gameplay/query events to concepts
- `evidence.js` — evidence-strength/update rules
- `playerModel.js` — local learning profile state
- `profileStore.js` — IndexedDB/storage abstraction
- `scheduler.js` — review priority, cooldown, intervention eligibility
- `questionQuality.js` — candidate split/information value
- `interventions.js` — intervention selection/priority/budget
- `recap.js` — end-of-match recap and retrieval
- `adaptiveDeck.js` — bounded light weighting
- `researchTransport.js` — disabled/in-memory abstractions only
- `index.js` — public Learning Engine API

Exact decomposition may differ if a cleaner architecture is justified.

Do not put most Learning Engine logic directly inside `App.js`.

The Learning Engine should consume semantic events rather than reading arbitrary UI state.

============================================================
5. COMMON GAMEPLAY EVENT CONTRACT
============================================================

Support at least:

- `MATCH_STARTED`
- `QUESTION_ASKED`
- `ANSWER_RECEIVED`
- `CARDS_SELECTED_FOR_ELIMINATION`
- `CARDS_ELIMINATED`
- `GUESS_MADE`
- `MATCH_FINISHED`

Learning-specific events may include:

- `PREDICTION_REQUESTED`
- `PREDICTION_SUBMITTED`
- `SELF_EXPLANATION_REQUESTED`
- `SELF_EXPLANATION_SUBMITTED`
- `FEEDBACK_SHOWN`
- `BOARD_LENS_USED`
- `RETRIEVAL_REQUESTED`
- `RETRIEVAL_SUBMITTED`

Requirements:

- events should have stable names and versionable payloads;
- events should carry structured scientific/query data where available;
- avoid putting Firebase types in the Learning Engine event contract;
- do not use Firebase as the event bus;
- online multiplayer should emit/observe equivalent local learning events without changing authoritative room semantics;
- ordinary local/solo play should produce the same conceptual event vocabulary.

============================================================
6. CONCEPT TAXONOMY V1
============================================================

Use stable concept IDs. The package machine-readable taxonomy is authoritative unless the repository data model requires a documented naming adapter.

Explorer core/supporting targets include at least:

- radioactivity as a physical phenomenon;
- natural vs artificial radioactivity;
- contextual risk reasoning;
- irradiation/exposure vs contamination;
- element vs isotope;
- alpha decay/basic mechanism;
- beta-minus/basic mechanism;
- beta-plus/basic mechanism;
- electron capture/basic mechanism;
- gamma radiation/transition concept at Explorer depth;
- decay mode vs emitted radiation;
- half-life concept;
- half-life order/category comparisons;
- PET;
- SPECT;
- radionuclide therapy;
- PET <-> beta-plus connection;
- SPECT <-> gamma connection;
- environment;
- natural radioactivity as a distinct breadth category;
- radon;
- astronomy/cosmogenic contexts;
- dating/geoscience;
- industry;
- research;
- yes/no classification reasoning;
- discriminating-question reasoning.

Scientist adds at least:

- Z;
- A;
- N;
- N = A - Z;
- quantitative/log half-life;
- beta-plus vs electron-capture nuance;
- gamma transition nuance;
- PET annihilation mechanism;
- alpha-therapy reasoning;
- beta-minus-therapy reasoning;
- nuclear activation nuance as supporting content;
- quantitative threshold reasoning;
- deeper question-information reasoning.

Chemistry properties such as family, metallicity, group/period, physical state and melting-point category are secondary/supporting in V1.

Production routes, excitation functions and cross sections are NOT Learning Engine V1 targets.

============================================================
7. SCIENTIFIC COMMUNICATION BOUNDARY
============================================================

The game must not teach or imply “radioactivity is good” or “radioactivity is bad”.

The intended broad scientific model is:

Radioactivity is a physical phenomenon; risk depends on context/pathway/exposure, and radionuclides also have important roles in medicine, environment, natural processes, astronomy/cosmogenic phenomena, dating, industry and research.

Do not minimize hazards.

Explorer irradiation messaging must be precise:

- external irradiation/exposure does not automatically make a person/object radioactive;
- being near a PET patient does not make the nearby person radioactive;
- approved food irradiation under ordinary food-irradiation conditions does not make the food radioactive;
- distinguish exposure from contamination.

Do not routinely introduce activation exceptions in Explorer feedback.

Scientist may surface the nuance that suitable particle/radiation types and energies can induce nuclear activation.

============================================================
8. PLAYER MODEL
============================================================

Persist a local learning profile in the browser.

Prefer IndexedDB with a clean testable abstraction and a safe local fallback if needed.

Normal gameplay must not require an account or cloud profile.

Suggested concept record fields:

- `exposures`
- `independentSuccesses`
- `assistedSuccesses`
- `spontaneousUses`
- `retrievalSuccesses`
- `mistakes` or `errors`
- `lastSeenAt`
- `lastIndependentSuccessAt`
- `lastExplicitExplanationAt`
- `lastInterventionMatchIndex`

A derived confidence/review-priority value may be computed in a pure replaceable function rather than stored as an opaque mastery probability.

Exposure MUST NOT equal mastery.

Strong evidence examples:
- correct spontaneous scientifically meaningful question;
- correct manual elimination without assistance;
- correct retrieval;
- successful transfer/reuse.

Medium evidence examples:
- correct prediction;
- correct structured self-explanation;
- autonomous correction after feedback.

Weak evidence examples:
- seeing an explanation;
- opening a card;
- automatic elimination done by the program;
- board-lens use.

Do not display fake mastery percentages to the player.

============================================================
9. INTERVENTION BUDGET AND PRIORITY
============================================================

Per completed normal match:

- maximum 3 in-game educational interventions;
- target average 1–2;
- zero is allowed;
- do not fire multiple learning interventions from the same player action;
- end-of-match recap is separate from the in-game budget.

Priority:

1. meaningful misconception correction exposed by gameplay;
2. retrieval opportunity for a review-due core concept;
3. Explorer prediction;
4. structured self-explanation;
5. short question-quality feedback.

The scheduler should choose whether to intervene; interventions are not hard-coded every N turns.

============================================================
10. EXPLORER BEHAVIOR
============================================================

Explorer defaults to automatic/simplified elimination.

When a structured question has been reliably interpreted and deterministic classification is possible, the Learning Engine MAY occasionally pause before automatic elimination and ask the player to predict which cards are incompatible.

Flow:

question answered
-> deterministic compatible/incompatible set available
-> optional prediction intervention
-> player selects cards believed eliminable
-> compare with deterministic result
-> concise scientific feedback
-> real automatic elimination happens

Only trigger where:
- query interpretation is reliable/structured;
- enough cards remain for the task to be meaningful;
- intervention budget allows it;
- concept is not overused/in cooldown;
- no fairness/secret leakage occurs.

Feedback must contain the relevant scientific reason/property, not only “correct/incorrect”.

Example style:

“Almost: F-18 emits beta+, so it is still compatible with this answer.”

Do not reveal the opponent's secret card.

============================================================
11. SCIENTIST BEHAVIOR
============================================================

Scientist defaults to manual elimination.

Do not add Explorer prediction before elimination because manual classification is already retrieval practice.

Allow scientific mistakes. Do not immediately block every inconsistent elimination.

Where deterministic evidence exists, capture the mistake and preferably give short delayed feedback at the end of the elimination/review phase.

Scientist may use deeper concepts:
- explicit Z/A/N;
- N = A - Z;
- quantitative/log half-life;
- more rigorous transformations;
- PET annihilation;
- qualitative alpha vs beta-minus therapeutic range/LET reasoning.

No cross-section training yet.

============================================================
12. MISCONCEPTIONS V1
============================================================

Support targeted corrections for at least:

- radioactive = artificial;
- radioactive = automatically/extremely dangerous in all contexts;
- different isotope = different element;
- longer half-life = always more dangerous;
- beta-plus = gamma;
- PET radionuclide directly emits the detected annihilation photons;
- gamma is simply equivalent to beta-minus decay;
- irradiation = contamination;
- irradiation necessarily makes a person/object radioactive.

Do not turn these into random lectures. Trigger only when gameplay provides relevant evidence.

A repeated clear misconception may justify one cooldown override with a short corrective message.

============================================================
13. QUESTION INFORMATION VALUE VS LEARNING VALUE
============================================================

Keep two independent dimensions.

### Information value

How well the yes/no question splits the current candidate set.

Suggested player-facing categories:
- very discriminating;
- useful;
- weakly discriminating;
- no discrimination.

Implement using deterministic candidate-set counts. Do not expose a numeric information-gain score unless needed for debugging/research.

This is primarily a gameplay/process metric, NOT a conceptual-test outcome.

### Learning value

Classify the concept as:
- core;
- supporting;
- secondary.

Never collapse these into one opaque “question score”.

============================================================
14. BOARD LENS
============================================================

Implement an optional contextual relevant-property lens for hidden secondary/supporting properties.

Example:
If a valid structured question asks whether the element is metallic, a temporary lens may display metallic/non-metallic information over candidate cards.

Lens rules:
- temporary;
- property-specific;
- no automatic card closing;
- usage counts as assistance, not mastery;
- do not expose the opponent's secret;
- do not trivialize Scientist core targets such as decay mode, half-life, Z/A/N or medical application reasoning unless an explicit scaffold rule allows it.

============================================================
15. SELF-EXPLANATION
============================================================

Implement short structured multiple-choice self-explanation interventions only.

Example:
“Why can this card be eliminated?”

Choices should be generated/selected from deterministic scientific relations relevant to the preceding gameplay action.

Keep them brief.

No free-text LLM grading in V1.

============================================================
16. SPACING / COOLDOWN
============================================================

Implement transparent simple scheduling.

Explicit explanation cooldown for the same concept:

repeat only if:
- at least 3 completed matches have passed AND at least 24 hours elapsed;

OR
- at least 7 days elapsed.

A clearly repeated misconception may override once with a short correction rather than repeating a full identical explanation.

Retrieval practice may occur during explanation cooldown.

Review-priority time windows may be approximately:
- first meaningful increase after ~7 days;
- moderate after ~30 days;
- strong verification/retrieval priority after ~90 days.

Never tell the player “you forgot this”.

============================================================
17. ADAPTIVE DECK — LIGHT ONLY
============================================================

Implement bounded/light adaptation.

Most deck selection must remain random.

A minority of weighting may favour:
- concepts due for retrieval;
- concepts with repeated mistakes;
- anchor radionuclides.

No card/content locks.

No deterministic drill deck.

For online competitive play:
- one canonical shared deck for both players;
- never personalize the two players' decks independently.

Frozen anchor set:

- F-18
- Tc-99m
- I-131
- Lu-177
- Ra-226
- At-211
- C-14
- K-40
- Rn-222
- Co-60
- Cs-137
- U-235
- U-238

Do not add Tb-149 to the frozen anchor list unless separately approved.

Do not invent scientific values.

============================================================
18. END-OF-MATCH RECAP
============================================================

At match completion provide a short learning recap:

- at most 2–3 concepts actually encountered in that match;
- at most one short adaptive deterministic retrieval item if appropriate.

No XP or score.

Do not turn recap into a mini-exam.

============================================================
19. RESEARCH READY, BUT DISABLED
============================================================

The supplied package contains the full research-design track (RRCI, study draft, DPO brief, data dictionary). It is context for future work, NOT authorization to collect research data now.

Implement only a clean abstraction such as:

- `DisabledResearchTransport`
- `InMemoryResearchTransport`

with an interface suitable later for:

- `startSession`
- `recordEvent`
- `submitPreTest`
- `submitPostTest`
- `finishSession`

Default MUST be `DisabledResearchTransport`.

Normal gameplay must produce no remote educational/research telemetry.

Do NOT:
- create a research Firebase schema;
- reuse multiplayer Firebase for research logging;
- use Firebase anonymous UID as a scientific participant ID;
- collect raw natural-language gameplay questions for research by default;
- add names, exact DOB, precise location or device fingerprinting.

Future identity separation must support:
- local player profile ID;
- technical Firebase anonymous UID if used;
- random pseudonymous `participantId`;
- `sessionId`;
- `studyId`.

INFN/DPO/legal/ethics decisions remain external to code.

============================================================
20. RRCI / RESEARCH FILES — DO NOT OVERIMPLEMENT
============================================================

The package contains RRCI V0.1 candidate items and validation material.

Status: NOT VALIDATED.

Do not implement a mandatory pre/post questionnaire in normal gameplay merely because these files exist.

Do not claim the RRCI is validated.

The RRCI track will proceed through expert review, cognitive interviews, pilot and psychometric analysis separately.

============================================================
21. CURRENT FIREBASE BUILD CONTRACT — DO NOT REGRESS IT
============================================================

Current production multiplayer uses one GitHub Actions repository variable:

`RN_FIREBASE_CONFIG`

The GitHub Pages workflow passes it to `npm run build`.

`scripts/build.mjs` writes `dist/firebase-config.json`.

Local development may use the gitignored root `firebase-config.json`.

The app lazy-loads Firebase only for online play.

Do NOT reintroduce the obsolete package-draft design using per-field:
- `RN_FIREBASE_API_KEY`
- `RN_FIREBASE_AUTH_DOMAIN`
- etc.

Do not modify Firebase rules/config architecture unless a verified issue requires it.

============================================================
22. LLM BOUNDARY
============================================================

The optional local/browser LLM may help interpret language later, but it must not be the scientific authority.

Learning Engine V1 must work with no LLM.

Do not:
- require an LLM download to learn/play;
- grade free-text learning responses with an LLM;
- generate scientific truth solely from an LLM;
- change deterministic game answers based on LLM output.

============================================================
23. TEST REQUIREMENTS
============================================================

Add deterministic tests for at least:

### Level migration
- only Explorer/Scientist are normal new learning levels;
- `base -> explorer`;
- `intermediate -> explorer`;
- `expert -> scientist`;
- new Explorer online config serializes compatibly;
- new Scientist online config serializes compatibly.

### Concepts/evidence
- concept mapping;
- exposure != mastery;
- independent evidence > assisted evidence;
- spontaneous correct use is strong evidence;
- board-lens use is assistance, not mastery;
- mistakes update the intended concept without corrupting unrelated concepts.

### Question quality
- information-value classification;
- no-discrimination case;
- informationValue and learningValue remain independent.

### Scheduler/interventions
- max 3 in-game interventions;
- priority order;
- zero interventions allowed;
- same action does not trigger multiple interventions;
- cooldown;
- repeated-misconception override;
- review-priority time windows;
- Explorer prediction eligibility;
- Scientist does not receive redundant prediction.

### Adaptive deck
- weighting is bounded;
- most selection remains random;
- anchor weighting bounded;
- review/mistake weighting bounded;
- no card dominates;
- online players share one canonical deck.

### Persistence/research
- local-profile persistence/storage abstraction;
- migration/schema versioning;
- `DisabledResearchTransport` is default;
- normal gameplay performs no research network write.

### Regression
- existing solo gameplay works;
- existing local two-player works;
- existing online multiplayer works;
- Firebase rules tests remain valid;
- refresh/reconnect remains unchanged;
- no Learning Engine change forces an LLM download.

Do not weaken existing tests to pass.

If a pre-existing unrelated failure remains, document it exactly.

============================================================
24. UX RULES
============================================================

Keep interventions concise and game-native.

Avoid:
- modal spam;
- long lectures mid-turn;
- repeated identical explanations;
- visible mastery percentages;
- badges/XP/streaks;
- mandatory quiz gates;
- blocking normal play because the local profile cannot be loaded.

Explorer scaffolding may be explicit.
Scientist scaffolding should fade/be less explicit.

Translations should follow the existing IT/EN/FR architecture where the new UI is user-facing.

============================================================
25. IMPLEMENTATION ORDER
============================================================

Work incrementally and commit logical checkpoints:

1. inspect/recover current state and baseline tests;
2. implement two-level user-facing adapter with no learning behavior yet;
3. add semantic gameplay-event contract with no visible behavior change;
4. add local profile persistence and concept/evidence model;
5. add scheduler/intervention budget;
6. add Explorer prediction;
7. add Scientist manual-elimination learning feedback;
8. add question-quality feedback;
9. add board lens for secondary/supporting properties;
10. add structured self-explanation;
11. add recap/retrieval;
12. add light adaptive deck;
13. add disabled/in-memory research transport;
14. run full regression + online/emulator/rules tests;
15. update recovery/progress documentation.

Do not attempt to implement all research-study UX/backend in this task.

============================================================
26. RECOVERY / PROGRESS FILE
============================================================

Create and continuously maintain:

`docs/LEARNING_ENGINE_PROGRESS.md`

It must include:
- branch name;
- current commit SHA;
- completed work;
- partial work;
- remaining work;
- exact test/build status;
- known limitations;
- intentional deferrals;
- any compatibility decisions.

The repository itself remains the source of truth.

============================================================
27. FINAL DELIVERABLE REPORT
============================================================

At completion report:

- branch name;
- commits;
- files added/changed;
- exact two-level migration behavior;
- event contract;
- concept taxonomy implementation;
- player-profile schema;
- persistence mechanism;
- evidence rules;
- scheduler/intervention rules;
- Explorer behavior;
- Scientist behavior;
- question-quality behavior;
- board-lens behavior;
- adaptive-deck behavior;
- recap/retrieval behavior;
- ResearchTransport status;
- Firebase/multiplayer regressions checked;
- tests executed and exact results;
- anything intentionally deferred.

Do not merge directly to `main` unless explicitly instructed. Prefer a reviewable PR.
