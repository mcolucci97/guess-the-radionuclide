# Research Mode specification

## Separation from normal play

Normal users can play without joining a study.

Research Mode is activated only by:
- study invitation/code/link;
- study configuration;
- information/authorization gate defined for that study;
- participant assent/confirmation where required.

If the gate is not satisfied, gameplay remains available where appropriate, `researchLogging = false`, and no research event upload occurs.

## Research transport

Define an interface such as:

```js
researchTransport.startSession(...)
researchTransport.recordEvent(...)
researchTransport.submitPreTest(...)
researchTransport.submitPostTest(...)
researchTransport.finishSession(...)
```

Implementations:
- `DisabledResearchTransport` — default;
- `InMemoryResearchTransport` — tests;
- future approved backend transport (Firebase or INFN infrastructure).

Do not couple Learning Engine logic directly to Firebase.

## Identity

Keep separate:
- local learning profile ID;
- Firebase anonymous UID if Firebase is used technically;
- `participantId` random pseudonymous scientific ID;
- `sessionId`;
- `studyId`.

Do not use Firebase UID as the scientific/public participant identifier.

## Study authorization configuration

Do not hard-code a legal interpretation. A study configuration can declare gates such as:

```json
{
  "minimumAge": 14,
  "requiresParticipantConfirmation": true,
  "requiresParentalAuthorizationUnder18": true,
  "requiresMinorAssent": true,
  "allowRemoteParticipation": false
}
```

Final values must come from the approved INFN protocol/DPO guidance.

## Data minimization

Default research data:
- age band;
- education band;
- prior exposure to radioactivity/nuclear science;
- pre-test responses;
- structured gameplay events;
- post-test responses;
- intervention metadata;
- timings;
- software/study version.

Avoid by default:
- name;
- surname;
- email;
- exact birth date;
- precise location;
- exact school name in the analysis table;
- raw free-text gameplay questions;
- device fingerprint.

## Open-text research items

A controlled open response may be scientifically valuable. If used, tell participants not to enter names/personal information, store it only when covered by the protocol, and keep it separate from routine gameplay logging.

## Minor participants

Architecture must support 14–17-year-old school participants, but the software must not decide the legal basis itself. Support parent/guardian status if the protocol requires it, minor assent, and refusal of research logging.

## Research export

Export a pseudonymized analysis dataset with random participant IDs, separate authorization records, no direct identifiers, and explicit versions of questionnaire/game/learning engine.

## Retention and deletion

Make retention configurable per study. Do not hard-code indefinite storage.
