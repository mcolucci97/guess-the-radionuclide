# Separate research backend (Cloudflare Worker + D1)

This backend is intentionally independent from the production multiplayer Firebase project. It is designed for the Research Mode described in `docs/learning-spec-v3/docs/RESEARCH_MODE_SPEC.md` and remains inert until a study is explicitly configured and activated.

## What it stores

- a pseudonymous participant row (`study_id`, random `participant_id`, age band);
- a separate authorization record keyed by a hash of the participant token and the participant-information version;
- a research session with a server-generated upload capability;
- structured gameplay events only;
- pre/post responses when those interfaces are wired into the UI later.

It does not require names, email addresses, exact dates of birth, precise location, Firebase UID, device fingerprint or raw natural-language gameplay questions.

## Deploy

1. Create a Cloudflare D1 database.
2. Copy `wrangler.toml.example` to `wrangler.toml` and insert the D1 database id.
3. Apply `migrations/0001_initial.sql` with Wrangler/D1.
4. Copy `studies.example.json`, complete only the fields approved for the study, hash any access code with SHA-256, and set the JSON as `RESEARCH_STUDIES_JSON` (prefer a Worker secret/managed variable; do not commit live codes).
5. Keep the study `active: false` until the participant information, legal basis, retention, minor procedure and infrastructure have been approved by INFN/DPO.
6. Deploy the Worker and set the web application's `research-config.json` endpoint (see the root example file).

The example study is deliberately adult-only and inactive. This avoids silently deciding the still-open legal/authorization questions for 14–17-year-old participants. The software supports minor assent and a configurable study-code gate, but a real minor flow must use the mechanism approved by INFN/DPO.

## Security model

The public study endpoint returns only display/gating metadata. Study/access-code hashes are never returned. Session creation checks the study gate and returns a random upload token. Every subsequent session request must provide that token in `X-Research-Session-Token`; only its SHA-256 hash is stored. Events are idempotent by `event_id`, batched, size limited and constrained to the structured event types. CORS is study-specific.

The authorization registry is a separate D1 table from the analysis tables. If INFN requires physical/database separation rather than logical separation, move that table to a second binding before production activation.

The Worker code does not persist client IP addresses or `User-Agent` values in the research tables. Cloudflare/platform operational logs are a separate infrastructure question and their configuration/retention must be included in the INFN/DPO review before production activation.

## Withdrawal endpoint

The backend also exposes a technical withdrawal primitive using the participant secret token. No participant-facing withdrawal UI is activated yet because the final wording/process must match the approved study procedure.
