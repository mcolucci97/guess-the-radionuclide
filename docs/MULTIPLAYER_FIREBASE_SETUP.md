# Multiplayer Firebase setup

The frontend remains on **GitHub Pages**. Firebase supplies only Anonymous Authentication and Realtime Database, compatible with the Spark plan. No Cloud Functions, Firebase Hosting, external AI, model weights or visible account signup are needed. Offline/single-player/local/atlas modes do not initialize Firebase.

## 1. Project and anonymous authentication

Create or select a project in the [Firebase console](https://console.firebase.google.com/). Keep Spark unless you intentionally choose otherwise. Under **Build → Authentication → Sign-in method**, enable **Anonymous**. This gives each browser a persistent anonymous UID, not a public profile. See [anonymous web authentication](https://firebase.google.com/docs/auth/web/anonymous-auth).

## 2. Realtime Database

Create **Realtime Database**, not Cloud Firestore, and choose a region. Start locked, not with public test rules. Copy the exact database URL displayed in the console; its hostname may end in `firebaseio.com` or `firebasedatabase.app`. See [Realtime Database web setup](https://firebase.google.com/docs/database/web/start).

## 3. Register the web app and supply its public config

Under **Project settings → General**, register a web app (`</>`). Do not enable Firebase Hosting. Copy only the web configuration values corresponding to `firebase-config.example.json`.

For GitHub Pages, set repository **Settings → Secrets and variables → Actions → Variables → New repository variable**:

- Name: `RN_FIREBASE_CONFIG`
- Value: the complete JSON object, with double-quoted keys/strings, not `const firebaseConfig = ...`.

`.github/workflows/static.yml` passes this variable to `npm run build`, which writes `dist/firebase-config.json`. The config is public by design; database rules and auth provide access control. Never put a service-account JSON, private key or administrator token here.

For local development, copy `firebase-config.example.json` to `firebase-config.json` in the repository root and replace the placeholders. That file is ignored by Git. Alternatively set the same environment variable. Run `npm ci`, `npm run build`, then `npm run dev`. The existing server prints the local URL.

## 4. Apply the database rules

Open **Realtime Database → Rules**, paste the full contents of `database.rules.json`, then **Publish**. Do not use broad `.read: true` or `.write: true` rules to resolve errors.

CLI alternative, after authenticating your own Firebase CLI account:

```sh
npx firebase deploy --only database --project YOUR_PROJECT_ID
```

`scripts/multiplayer-rules.mjs` is the maintainable source for the checked-in JSON. If editing it, run `npm run rules:generate`, review the JSON diff, and run the emulator tests before deploying. This task does not deploy anything to your Firebase project. See [Security Rules](https://firebase.google.com/docs/database/security).

## 5. Authorized domains and deployment

In **Authentication → Settings → Authorized domains**, add `mcolucci97.github.io` (hostname only, no protocol or repository path), and your custom domain if used. For local testing also add `localhost` and `127.0.0.1` when necessary. Keep the existing **Pages → Source: GitHub Actions** setting and deploy the reviewed branch through your normal merge/push workflow. Do not merge solely to test before reviewing the changes.

The build keeps relative URLs, so `/guess-the-radionuclide/` and its invite links work. Public config is loaded only when entering online multiplayer. A missing config produces a translated setup message without breaking offline play.

## 6. Test two devices

1. Open the same deployed build on two phones, or two separate browser profiles. Two tabs in the same profile deliberately share one anonymous identity and cannot occupy both seats.
2. On phone A choose **Two players · online**, configure deck/audience/level/card elimination, start and create a game.
3. Copy the six-character code or invite link; on B choose **Join game**. Check both decks match and both clients see readiness.
4. Privately choose and confirm a secret on each phone. Host starts first.
5. Send a normal question, then test an unrecognized question. With answer assistance on, the receiver must be able to choose **I understood the question · answer anyway**, then YES/NO. Suggestions never submit themselves.
6. Test **I asked it verbally**; no audio, microphone or speech-to-text exists. Answer manually, close cards, end the turn.
7. Refresh during a pending answer and after filtering. Check identity, turn and board remain unchanged. Briefly disconnect/reconnect; neither client should win from disconnection. Back to menu preserves automatic resume; **Leave this game** clears only the local resume shortcut and lets you create/join another room. The old seat stays reserved and can be recovered with the same identity/code.
8. Test a wrong and a correct guess, plus a third browser trying to join a full room.

Production validation still requires your real project/config, deployed rules, and this two-device check. Emulator success does not prove your deployed project has the right settings.

## Automated checks (no production account)

```sh
npm ci
npm test
npm run test:multiplayer
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
npm run test:rules
npm run test:online
```

The rules and online-browser commands start local Firebase Auth/RTDB emulators using `demo-radionuclide`; they require Java (21 recommended; verified locally with 17). First run downloads the emulator and browser. `test:online` builds with a **build-time-only** emulator switch and fictitious web config, runs three isolated mobile browser contexts (two players plus a rejected third), then rebuilds production assets. Never deploy the temporary emulator build. CI has no production credentials. A known baseline failure in `npm test` is documented in `MULTIPLAYER_PROGRESS.md`; the missing scientific integrity manifest has not been invented or the test disabled.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Online not configured | `firebase-config.json` exists under the deployed site path, valid JSON, no `YOUR_` placeholders; GitHub variable name exactly `RN_FIREBASE_CONFIG`; rebuild/redeploy. |
| Authentication fails | Anonymous provider enabled; correct API key/project/app ID; authorized hostname; project API-key restrictions allow the app. |
| Permission denied / game inaccessible | Actual RTDB rules published, correct database URL, two different browser identities; third players are intentionally denied. Do not loosen root access. |
| Reconnecting | Network and browser restrictions; Firebase service accessibility; correct database region/URL. Actions remain disabled until connected. |
| Old app after deploy | Close/reopen tabs or reload after the service-worker update. Both phones must use the same schema/build. |
| Cannot resume after clearing storage | Anonymous identity was deleted. There is intentionally no account/password recovery or seat takeover. Create a new match in a fresh browser profile. |
| Long-lived unused rooms | No server/TTL cleanup is installed. Review usage and manually delete abandoned room/private/presence records using the console as administrator. |

## Security and honest limitations

- `/rooms/CODE` contains only public match state. It never includes either secret. No root/room-list read is granted. An authenticated user may read an unfilled room to join; after it fills, only its two UIDs can read it.
- `/private/CODE/UID` is readable/writable only by its owner, who must be assigned to that room. There is **no ancestor read grant** that exposes private children. Secret IDs must belong to the canonical deck and cannot change or be deleted once confirmed.
- Rules freeze host/guest/config/deck, check bounded strings and enums, enforce authorized phase/turn transitions and monotonic revisions, and prevent modifying finished matches. Real rules check guess correctness against the responder’s private secret, without giving its read permission to the asker.
- `actionId` plus revision compare-and-set protects repeated/stale moves. Readiness is commutative. Filtering uses a private applied-event marker, so retries/refresh do not filter twice. Shared and private writes are deliberately separate; recovery repairs a confirmed private secret whose ready flag was interrupted.
- Presence uses one `onDisconnect` record per connection/tab; disconnect never determines a winner. See [Firebase presence](https://firebase.google.com/docs/database/web/offline-capabilities).
- A friend holding an open code can claim the second seat. Anonymous auth is not anti-spam or invitation authentication. No App Check, rate-limit service, room expiration or server cleanup is configured; monitor Spark quotas. A dishonest participant can inspect their own board, choose dishonest manual answers, refuse to respond, or use external scientific knowledge. The computer’s interpretation is advisory, not authoritative. A guess waits for the responder’s client to reconnect; no trusted server executes it while both clients are absent.
- The client validates deck uniqueness and query meaning; rules protect immutable configuration and field types, not the truth of natural-language interpretation. These are friendly two-player games, not a cheat-proof ranked service.
