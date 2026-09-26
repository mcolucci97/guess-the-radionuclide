# Current project state — 2026-09-25

Repository: `mcolucci97/guess-the-radionuclide`

## Production multiplayer

The current `main` branch contains the online multiplayer implementation under `src/multiplayer/` and it has been deployed through GitHub Pages.

The owner has performed a real production test and reports that online multiplayer works correctly.

Treat multiplayer as a stable baseline. Learning Engine work must not redesign the multiplayer state machine or Firebase data model unless a generic local gameplay-event hook absolutely requires a small compatibility change.

## Verified deployment integration

GitHub Pages build receives:

```yaml
env:
  RN_FIREBASE_CONFIG: ${{ vars.RN_FIREBASE_CONFIG }}
```

`scripts/build.mjs` writes `dist/firebase-config.json` from `RN_FIREBASE_CONFIG` (or local `firebase-config.json`).

The production build artifact contains the expected Firebase Web config. The web config is public by design; security is provided by Firebase Authentication + Realtime Database Security Rules.

## Current multiplayer compatibility constraint

The deployed multiplayer canonical config currently validates:

- `audience`: `child | adult`
- `level`: `base | intermediate | expert`
- `assist`: `manual | assisted`

Do not casually change these serialized values because Firebase rules also validate them.

For the new two-level UI/Learning Engine, use an adapter. See `TWO_LEVEL_MIGRATION_SPEC.md`.

## Existing test baseline

Before changing code, rerun the actual current test/build suite and establish a fresh baseline. Previous multiplayer work reported a known pre-existing failure related to missing `data/raw/manifest.json`; verify rather than assuming that status is unchanged.

Do not weaken tests to obtain a green run.

## Scope now

Immediate target:

1. simplify normal level choice to Explorer / Scientist;
2. add common gameplay semantic events;
3. implement local Learning Engine V1;
4. keep research transport disabled;
5. preserve solo/local/online regressions.
