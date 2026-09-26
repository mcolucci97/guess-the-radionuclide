# Mastery & Spacing Model V1

## Principle

Do not pretend to measure knowledge with false precision. The internal model exists to decide what should be revisited, avoid repeating the same explanation, choose occasional interventions, and lightly bias future decks/questions. It is not shown as a percentage to the player.

## Local persistence

Use IndexedDB for the durable learning profile.

Suggested structure:

```json
{
  "schemaVersion": 1,
  "playerProfileId": "local-random-id",
  "selectedLevel": "explorer",
  "concepts": {},
  "interventionHistory": [],
  "matchHistorySummary": [],
  "lastUpdated": "ISO timestamp"
}
```

## Evidence hierarchy

Strong positive evidence:
- spontaneous correct question using a concept;
- correct manual elimination based on the concept;
- correct retrieval item without assistance;
- correct transfer/application to a new case.

Medium positive evidence:
- correct prediction with light support;
- correct multiple-choice self-explanation;
- self-correction after feedback.

Weak positive evidence:
- simply seeing a fact;
- opening a card;
- automatic elimination performed by the game.

Negative evidence:
- eliminating a card inconsistently with the observed answer;
- choosing a misconception-consistent explanation;
- repeated contradictory use of the same concept.

## Transparent V1 state

Store counters rather than one magical probability:

`exposures`, `independentSuccesses`, `assistedSuccesses`, `spontaneousUses`, `retrievalSuccesses`, `errors`, `lastSeenAt`, `lastIndependentSuccessAt`, `lastExplicitExplanationAt`, `lastInterventionMatchIndex`.

A derived `reviewPriority` should live in one pure function so it can later be replaced.

## Confidence decay

- no meaningful decay during first 7 days;
- mild review-priority increase after 30 days;
- stronger verification priority after 90 days.

The player is never told "you forgot this".

## Explicit-information cooldown

Repeat the same explicit teaching message only if:
- at least 3 completed matches have passed AND at least 24 hours elapsed;

OR
- at least 7 days elapsed.

A repeated clear misconception may override once with a short corrective message, not an identical explanation.

Retrieval opportunities are allowed during cooldown because they are not repeated explanation.

## Adaptive deck

Adapt lightly:
- majority of selection remains uniform/random;
- minority of pressure targets review-due concepts;
- anchor radionuclides get only a modest weight increase;
- no card should dominate;
- competitive online multiplayer uses one canonical shared deck and does not personalize deck composition separately for the two players.
