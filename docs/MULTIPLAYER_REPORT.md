# Multiplayer V3 — implementation report

Date: 24 September 2026. Implementation and emulator/browser validation completed locally. **Not pushed, not merged, not deployed.**

## Branch and checkpoints

Branch: `feature/multiplayer-online`, based on the actual GitHub main `153181590ff2c018548aa726616c1546e12b0ed9`. The current main’s newer interpreter/model were preserved, not replaced by an earlier ZIP.

- `955159d` — local spoken turns, independent manual boards and confirmed guesses.
- `e63339a` — room state machine, service, private boards, lazy Firebase adapter and unit tests.
- `992db05` — mobile online UI, localization and actual RTDB rules.
- `de1893b` — emulator-verified transaction/recovery fixes, online browser tests, setup and CI.
- `a66141c` — recovery of pending actions after concurrent writes, bounded retries, React-hook regression tests and reviewed UI refinements.
- Final checkpoint: the commit containing this report and final results. The delivery includes the exact complete commit log and a Git bundle.

Remote creation was retried during recovery and returned **403 Resource not accessible by integration**; direct push had no GitHub credentials. No PR was created, and remote `main` was not changed. The bundle can be imported and pushed by an authorized repository writer.

## What works

**One device:** ask and answer aloud; no normal-turn textarea/parser. Each player manually closes/restores their own cards. End turn covers the screen and requires confirmation before passing control. Guesses require choosing a card and confirming. A wrong guess passes the turn without revealing the secret; a correct guess finishes and reveals the result.

**Two devices:** host creates an authenticated room with a six-character code excluding O/0/I/1; guest joins using the code or copyable invite URL. Transactions allocate exactly two seats. Host persists the shared deck/config; guest never shuffles a second deck. Each phone confirms its own secret privately; only ready flags are public. Host starts first.

**Questions:** written text is delivered exactly, including when parsing fails. The existing deterministic interpreter/semantic fallback is unchanged and no LLM is needed. Valid interpretations are serialized into `queryJson` (empty string represents no query, avoiding RTDB null/deletion ambiguity). Verbal mode synchronizes a question event with no text and no audio or speech processing.

**Answer assistance:** a separate private per-player toggle. When enabled for written questions it validates the received query, falls back to the existing interpreter as needed, and evaluates only the responder’s own secret. The human confirms a suggestion; it never submits itself. Failed/ambiguous/unsupported interpretations display the tested “answer anyway” escape. Successful interpretations also have a rejection/manual route. Verbal mode always has YES/NO.

**Elimination:** host-selected automatic/manual card elimination is separate from answer assistance. Automatic filtering uses only a human-confirmed usable query and runs on the asking player’s private board. Bypassed/rejected/unknown/verbal/manual answers carry no accepted query and permit manual card closure. Unknown card values are retained. Manual corrections can restore a card; an applied-event marker prevents repeated filtering after reconnect.

**Recovery and races:** persisted anonymous identity, URL + local resume shortcut, public/private subscriptions and per-tab `onDisconnect` presence. Refresh/reopen restores phase and private board. No disconnect victory. Revisions, action/question IDs, transactions and immediate UI busy guards prevent duplicate/stale moves. Readiness is commutative; recovery repairs an interrupted secret/ready sequence. Repairs queued while another write is busy resume when it finishes; failed repairs wait for retry/reconnect instead of looping. Explicitly leaving only clears the local shortcut, never replaces a seat or invents a winner.

## Architecture and files

| Files | Role |
| --- | --- |
| `src/App.js`, `src/upgrade.css` | Small integration into V3; local verbal flow, confirmation, online entry and reused card/dialog components. |
| `src/multiplayer/stateMachine.js`, `roomService.js` | Canonical config, pure authorized transitions, commands and private board operations. |
| `src/multiplayer/questions.js` | Existing interpreter/evaluator adapter, safe query validation, suggestions and conservative filtering. |
| `src/multiplayer/firebaseClient.js`, `firebaseTransport.js` | Lazy modular SDK, persisted anonymous auth, real transactions, isolated subscriptions and presence. |
| `src/multiplayer/useOnlineRoom.js`, `OnlineGame.jsx`, `i18n.js` | Resume/recovery, mobile flow and all new IT/EN/FR strings. |
| `src/multiplayer/memoryTransport.js` | Test-only in-memory transport; not imported by production. |
| `database.rules.json`, `scripts/multiplayer-rules.mjs` | Deployable RTDB rules and maintainable generator. |
| `firebase.json`, `firebase-config.example.json` | Emulator configuration and safe public web-config template. |
| `scripts/build.mjs`, `package*.json`, `.gitignore` | SDK/dev-test dependencies, public-config build input, ignored local/generated files. |
| `.github/workflows/static.yml`, `multiplayer-tests.yml` | Existing Pages deployment plus public-config variable; credential-free multiplayer CI. |
| `tests/browser.mjs`, `multiplayer.test.mjs`, `multiplayer-recovery.test.mjs`, `multiplayer.rules.mjs`, `browser-online.mjs` | Regression, state/service, real security and mobile two-client checks. |
| `docs/MULTIPLAYER_*`, browser result JSON and multiplayer screenshots, `README.md` | Setup, recovery checkpoint, report and executed-test evidence. |

Scientific data, 59 cards, interpreter, single-player strategy, LLM modules and training materials have **no diff against main**. React 19, custom esbuild, relative GitHub Pages paths, PWA and offline atlas/local/single-player remain intact.

## Security

Public state lives at `/rooms/CODE`; secrets/boards/preferences at `/private/CODE/UID`; presence at `/presence/CODE/UID/CONNECTION`. No shared parent read exposes private data. Each private path requires the assigned owner’s authenticated UID. Rules freeze confirmed secrets, both seats and canonical config/deck, enforce typed fields and permitted phase/revision transitions, and prevent reopening a finished game. Guess results are checked by rules against the responder’s private secret.

These were tested against **actual Firebase RTDB rules**, not only mocked permissions. Production settings have not been tested because no Firebase project/config was provided.

## Executed checks

| Command | Result |
| --- | --- |
| `npm test` | 657 pass, **1 pre-existing failure** (658 total). |
| `npm run test:multiplayer` | 19/19 pass (17 service/state + 2 React recovery tests). |
| `npm run build` | Pass; production/emulator switch off in final build. |
| `npm run test:e2e` | 11/11 browser checks pass, zero page errors. |
| `npm run test:rules` | 7/7 emulator security/real-adapter tests pass. |
| `npm run test:online` | 8/8 scenario groups pass using separate mobile browser contexts, real modular SDK, Auth/RTDB emulators and deployed-to-emulator rules; zero page errors. |
| `npm audit --omit=dev` | No reported production dependency vulnerabilities at execution. |
| `git diff --check`, rule regeneration comparison | Pass; checked-in rules match generator. |

The full-suite failure is `tests/engine.test.mjs` → “All nuclear snapshots match their content hashes”: canonical main lacks `data/raw/manifest.json`. It failed before changes (638 pass / 1 fail). The test was neither disabled nor weakened, and scientific data were not modified to hide it. Restoring that authoritative integrity manifest is separate follow-up work. The new CI intentionally reports this failure while still running multiplayer checks.

## External steps and limitations

1. An authorized repository writer imports/pushes the branch and reviews it; no automatic merge.
2. Create/select Firebase, enable Anonymous Authentication, create RTDB/register web app, supply public `RN_FIREBASE_CONFIG`, deploy `database.rules.json`, authorize the Pages hostname, and redeploy using the existing Pages workflow. Detailed instructions: `MULTIPLAYER_FIREBASE_SETUP.md`.
3. Test the deployed site on two real phones. Emulator tests do not certify the live project configuration.

Anonymous identity cannot be recovered after browser storage is cleared. A pending guess needs the responder’s client online to complete. There is no server cleanup, rate-limiting service, matchmaking or cheat-proof adjudication of natural-language answers; players can intentionally answer dishonestly. Anyone with an unused valid code can claim its second seat. These friendly-match limitations are documented rather than hidden. No LLM training/download, audio, Cloud Functions, new hosting backend or educational expansion was implemented.
