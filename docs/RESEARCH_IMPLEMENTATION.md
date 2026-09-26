# Research Mode — consent, pseudonymous identity and separate backend

Implementation date: 2026-09-26.

This increment implements the three infrastructure blocks that were intentionally deferred from Learning Engine V1: (1) the study information/participation gate, (2) pseudonymous participant/session identity, and (3) a separate research backend. It does **not** activate a real study by itself.

## 1. Fail-closed activation

Normal play still uses `DisabledResearchTransport` and produces no remote research traffic. Research Mode is entered only when the URL contains a study id, for example:

`...?study=pilot-2026`

The client then looks for `dist/research-config.json`. If no approved endpoint is configured, the study gate reports that research collection is unavailable and offers normal play without research. The research endpoint is not accepted from URL parameters.

`research-config.json` is intentionally gitignored. `research-config.example.json` documents the public configuration. The production build can also receive the same JSON through `RN_RESEARCH_CONFIG`.

## 2. Study information / participation gate

`src/research/ResearchGate.jsx` loads the public study configuration from the separate backend and shows the study-specific participant information supplied by that configuration. The application does not hard-code the legal basis, retention period or definitive INFN wording.

The gate supports:

- participant-information versioning;
- age-band selection (no exact date of birth);
- explicit participant confirmation;
- optional study access code;
- a configurable minor-participation switch;
- optional minor assent;
- optional organizer authorization-code mechanism for studies whose approved procedure uses one.

The included example study is inactive and adult-only. Minor research collection therefore cannot be enabled accidentally by the example configuration. A real 14–17 flow must use the procedure approved by INFN/DPO.

Declining the study returns to normal gameplay and leaves the research transport disabled.

## 3. Pseudonymous identity

`src/research/identity.js` creates two distinct identifiers:

- `participantId`: random pseudonymous scientific participant id, stable locally for the same study;
- `sessionId`: a new random id for each research session.

It also creates a high-entropy participant secret token. Only its SHA-256 hash is sent to the authorization registry. The raw token remains on the participant device and can later support an approved withdrawal/return-token flow.

The research identity is independent from:

- the local Learning Engine profile id;
- Firebase Anonymous Auth UID;
- multiplayer room ids.

The active upload capability is stored only in `sessionStorage`, not in the Learning Engine profile.

## 4. Research transport

`HttpResearchTransport` is now available in `src/learning/researchTransport.js`. It:

- activates only after the study gate has succeeded;
- projects Learning Engine semantic events to the research event vocabulary;
- never uploads raw natural-language gameplay questions;
- excludes secret-card and authentication identifiers;
- batches events;
- uses idempotent random `eventId` values;
- maintains a monotonic `clientEventIndex` per session;
- keeps a short retry queue in `sessionStorage`;
- retries after temporary network failures;
- authenticates uploads with a server-generated per-session capability token.

Learning Engine V1 no longer treats a match as a research session. Matches generate semantic events; opening/closing the scientific research session is owned by Research Mode. This keeps a future pre-test → game → post-test sequence in one research session.

## 5. Separate backend

`research-backend/` contains a Cloudflare Worker + D1 implementation. It is completely separate from the multiplayer Firebase project.

Tables:

- `research_participants` — study id, random participant id, age band;
- `authorization_records` — separate authorization evidence, participant-token hash and information version;
- `research_sessions` — pseudonymous session and upload-capability hash;
- `research_events` — structured gameplay events;
- `research_responses` — pre/post/delayed test response rows.

Routes:

- `GET /v1/studies/:studyId`
- `POST /v1/studies/:studyId/sessions`
- `GET /v1/sessions/:sessionId`
- `POST /v1/sessions/:sessionId/resume`
- `POST /v1/sessions/:sessionId/events`
- `POST /v1/sessions/:sessionId/pretest`
- `POST /v1/sessions/:sessionId/posttest`
- `POST /v1/sessions/:sessionId/finish`
- `POST /v1/studies/:studyId/participants/:participantId/withdraw`

The backend validates study status, origin, participant-information version and configured gates. It stores only the hash of session/participant capabilities. The event endpoint accepts only the structured research event vocabulary and limits payload/batch sizes. The application backend does not persist client IP addresses or `User-Agent` values in the research tables; infrastructure-provider logs remain an explicit deployment/privacy-review item. The withdrawal endpoint remains available for an existing study configuration even after new enrolment has been deactivated.

## 6. Deployment configuration

See `research-backend/README.md` and `research-backend/wrangler.toml.example`.

The study definition lives in `RESEARCH_STUDIES_JSON` on the Worker. Live study/access codes must not be committed. `studies.example.json` is deliberately `active: false` and contains draft placeholder wording.

The public game needs only:

```json
{
  "enabled": true,
  "endpoint": "https://YOUR-RESEARCH-WORKER.example.workers.dev"
}
```

provided as the local `research-config.json` or as `RN_RESEARCH_CONFIG` during the static build. The existing GitHub Pages workflow now passes the optional repository variable `RN_RESEARCH_CONFIG`; if it is unset, Research Mode remains fail-closed while multiplayer continues to use `RN_FIREBASE_CONFIG` exactly as before.

## 7. What remains intentionally out of scope

The RRCI/pre-test/post-test participant UI is still not integrated. The transport and backend endpoints are ready for it, but research sessions should not be activated for a definitive study until the questionnaire, participant information, legal basis, retention, minor procedure and infrastructure are approved.

No real study configuration, legal text, DPO decision, retention period or production endpoint has been invented in this increment.

## 8. Validation in this increment

- Learning + research unit tests: **37/37 passed**.
- Node syntax checks passed for the modified non-JSX client modules and the Worker.
- The production build was not rerun in this container because the extracted repository did not include `node_modules` and dependency installation was unavailable here. The GitHub Pages workflow remains the authoritative clean build (`npm ci` → `npm run build`) after upload.

See `docs/RESEARCH_VALIDATION.json`.
