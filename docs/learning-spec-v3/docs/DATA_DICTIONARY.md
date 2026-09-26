# Research data dictionary V1

## Participant table

| Field | Type | Notes |
|---|---|---|
| studyId | string | protocol/version identifier |
| participantId | random string | pseudonymous research ID |
| ageBand | enum | no exact DOB |
| educationBand | enum | broad category |
| stemBackground | enum | broad category |
| priorRadioactivityEducation | enum | none / school / university / professional |
| selectedGameLevel | enum | explorer / scientist |
| consentGateVersion | string | version only; authorization evidence separate |
| createdAt | timestamp | server timestamp where possible |

Suggested age bands: 14–15, 16–17, 18–20, 21–25, 26–39, 40+.

## Authorization registry — separate store

Possible fields:
- studyId;
- authorizationRecordId;
- participantTokenHash;
- participantInformationVersion;
- parentalInformationVersion;
- parentalAuthorizationStatus if required;
- minorAssentStatus if required;
- timestamps;
- withdrawal/revocation state.

Exact fields and legal basis must be approved by INFN.

## Pre/post response table

- studyId
- participantId
- sessionId
- testVersion
- phase (`pre`, `post`, optional `delayed`)
- itemId
- response
- correct / score
- responseTimeMs
- submittedAt

## Gameplay event table

Common:
- studyId
- participantId
- sessionId
- eventId
- clientEventIndex
- relativeTimeMs
- gameVersion
- learningEngineVersion
- level
- mode

Question:
- structuredQuestionType
- conceptIds
- informationValueCategory
- learningValueCategory
- candidateCountBefore
- yesCount
- noCount

Do NOT upload raw natural-language gameplay questions by default.

Elimination:
- candidateCountBefore
- candidateCountAfter
- eliminatedCardIds
- eliminationMode
- deterministicConsistency
- assistanceUsed

Intervention:
- interventionType
- conceptId
- triggerReason
- answer/choice
- correct
- feedbackId

Match:
- deckIds
- secretCardId if scientifically needed
- turnCount
- outcome
- durationMs

## Free-text research response

Store only for explicitly designed research items, not routine questions. Warn participants not to enter personal identifiers.
