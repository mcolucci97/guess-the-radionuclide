# Firebase configuration — current production architecture

This document supersedes older package drafts that described per-field `.env.local` variables.

## Multiplayer

Current production frontend remains GitHub Pages.

Firebase services used by multiplayer:
- Anonymous Authentication;
- Realtime Database.

No Firebase Hosting is required.

## Build configuration

The current repository uses one GitHub Actions repository variable:

`RN_FIREBASE_CONFIG`

Its value is a complete public Firebase Web config JSON object containing the fields used by the app, at least:

```json
{
  "apiKey": "...",
  "authDomain": "...",
  "databaseURL": "...",
  "projectId": "...",
  "appId": "..."
}
```

The GitHub Pages workflow passes it to `npm run build`.

`scripts/build.mjs` writes `dist/firebase-config.json`.

For local development, the repository supports a root `firebase-config.json`, which is gitignored.

Do not reintroduce obsolete per-field `RN_FIREBASE_API_KEY`, `RN_FIREBASE_AUTH_DOMAIN`, etc. unless performing an intentional config migration.

## Security boundary

Firebase Web config is public. Security depends on:
- Anonymous Auth identity;
- strict Realtime Database Security Rules;
- private/public path separation.

Never place service-account credentials or private keys in the frontend or GitHub Pages build.

## Learning Engine

The Learning Engine does not need Firebase.

Normal player learning profiles remain local in the browser.

## Research

Do not reuse multiplayer Firebase for research logging by default.

Research collection remains disabled until an INFN-approved backend and protocol exist.

If an approved Firebase research backend is later selected, it should be configured separately through a dedicated ResearchTransport implementation rather than imported into Learning Engine core logic.
