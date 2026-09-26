# GitHub Actions Firebase addendum — current state

The current production workflow already passes the repository variable to the build:

```yaml
- name: Build game
  env:
    RN_FIREBASE_CONFIG: ${{ vars.RN_FIREBASE_CONFIG }}
  run: npm run build
```

Do not replace this with obsolete per-field Firebase environment variables.

`RN_FIREBASE_CONFIG` is a GitHub Actions **repository variable** containing the Firebase Web config JSON.

The generated `firebase-config.json` is public in the deployed static site by design. Authentication and Realtime Database Security Rules are the security boundary.

Learning Engine work should not modify this workflow unless required by a verified build issue.
