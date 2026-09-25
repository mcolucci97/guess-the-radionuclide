# Multiplayer implementation progress

## Current branch
`feature/multiplayer-online`, latest implementation checkpoint `a66141cecb28556ba800594f9c6131f2e4359f08`; the final documentation/test-evidence commit contains this file. Use `git log -1` for its exact hash. Based on canonical main `153181590ff2c018548aa726616c1546e12b0ed9`, rechecked against GitHub during recovery. Remote still has only main.

## Completed
- Existing V3 inspected and extended; scientific data, parser, semantic model, AI strategy and LLM unchanged.
- Local verbal/manual turns, independent boards, privacy handoff, confirmed wrong/correct guesses.
- Online canonical deck/config, atomic two-seat join, own-secret confirmation, host first, raw written/verbal events, manual answers and separate personal assistance preference.
- Parser failure escape and successful-interpretation rejection; automatic filtering only after confirmed usable query, private applied-event marker.
- Lazy modular Firebase SDK, persisted anonymous auth, isolated public/private/presence subscriptions and real RTDB Security Rules.
- Refresh/reopen identity and phase recovery; no disconnect victory; explicit leave/new game; IT/EN/FR phone UI.
- Reviewed all previous uncommitted changes rather than replacing them.
- Fixed recovery effect missing a busy-state dependency: a pending guess/filter/ready repair now resumes after another write finishes. Failed repairs do not loop; explicit retry/reconnect can retry. Two deterministic React-hook tests pass.
- Real emulator rules: 7/7 pass again, including private access denial, immutable deck/secrets, turn/guess rules and simultaneous joins through real adapter.

## In progress
**Implementation and local validation completed.** No coding task in progress. Preparing the committed source/Git-bundle delivery because remote writing is denied.

## Not started
External only: authorized remote push/PR, production Firebase configuration/rules deployment, and a live two-phone validation. Remote create-branch was retried and still returns 403. No remaining planned multiplayer feature implementation.

## Architecture decisions
- Reuse existing `be`/`xe` cards, `ze` interpreter (deterministic then semantic), `validQuery`, `Ge`, `formatQuery` and card/dialog UI. Multiplayer never calls or downloads the optional LLM.
- Public rooms exclude secrets. Private data live under separate `/private/CODE/UID`, readable by assigned owner only. No parent read grant.
- Room actions use revision/action IDs and transactions; readiness is commutative. A fetched initial value seeds the SDK's null first callback; server compare-and-set remains authoritative.
- Queries are validated/serialized in queryJson; empty string means absent. Only acceptedQueryJson may filter; manual bypass clears it.
- Anonymous auth + room URL/local shortcut restore own seat. One presence record per connection. Repair attempts once per revision, with retry/reconnect reset.

## Important files
- `src/App.js`, `src/upgrade.css`: limited V3 integration/local turns/phone styles.
- `src/multiplayer/`: stateMachine, roomService, questions, firebaseClient/firebaseTransport, useOnlineRoom, OnlineGame, i18n; test-only memoryTransport.
- `database.rules.json`, `scripts/multiplayer-rules.mjs`: actual rules + generator.
- `firebase.json`, `firebase-config.example.json`, `scripts/build.mjs`, package files and workflows: emulator/public config/lazy build/CI.
- `tests/multiplayer*.mjs`, `tests/browser-online.mjs`, `tests/browser.mjs`: unit/hook/security/mobile/regression tests.
- `docs/MULTIPLAYER_FIREBASE_SETUP.md`, result JSON/screenshots: setup and recorded evidence. Final report being finalized.

## Tests
Final executed checks after recovery:
- `npm test`: 657 pass / 1 pre-existing failure (658 total).
- `npm run test:multiplayer`: 19/19 (17 service/state + 2 React-hook tests).
- `npm run build`: pass; final build is production, not emulator.
- `npm run test:e2e`: 11/11 browser checks; zero page errors.
- `npm run test:rules`: 7/7 actual emulator security/adapter tests.
- `npm run test:online`: 8/8 mobile scenario groups with Auth/RTDB emulators and production SDK; zero page errors.
- `git diff --check` and regeneration of checked-in rules: pass. Phone screenshot visually checked.
The first recovery browser attempt found the environment's Chromium installation missing; installed the test browser and reran successfully. Test cleanup now restores production assets even if browser launch fails. No LLM preparation/download/training occurred.
Canonical main baseline: 638 pass / 1 fail because `data/raw/manifest.json` is missing. Nuclear integrity test remains unchanged. Do not invent scientific data to hide it.

## Known issues
GitHub create-branch again returned **403 Resource not accessible by integration** during this recovery. Direct push also could not authenticate in this workspace. No remote branch/PR, merge or deployment. Local commits are preserved in the delivery Git bundle and exact committed source ZIP.
Anonymous identity cannot survive clearing browser storage. Pending guesses await the responder client. No automatic room cleanup or dishonest-answer adjudication; documented friendly-match limitations.

## Firebase status
SDK/auth/RTDB/presence/rules implemented and emulator-tested. No production project/config provided; build accepts public RN_FIREBASE_CONFIG or ignored firebase-config.json. Setup guide covers rules, domains, deployment and two-device test.

## Exact next actions
1. An authorized repository writer imports/pushes `feature/multiplayer-online` from the provided Git bundle (see README_IMPORT_IT.md in delivery). Inspect actual history before continuing; do not restart or overwrite this branch.
2. Review a PR against current main; do not merge without review.
3. Follow MULTIPLAYER_FIREBASE_SETUP.md: Anonymous Auth, RTDB, public web config, rules, authorized domain, Pages deployment.
4. Validate the deployed project on two physical phones. Keep emulator results distinct from live production validation.
5. Separately restore the authoritative missing nuclear integrity manifest if desired; do not fabricate it or weaken the existing test.
