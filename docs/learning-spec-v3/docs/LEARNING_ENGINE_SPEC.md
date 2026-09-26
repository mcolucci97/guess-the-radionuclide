# Learning Engine V1 specification

## Purpose

Transform *Guess the Radionuclide* into a serious game in which scientific knowledge improves deduction itself.

The learning objective is not political or attitudinal advocacy about nuclear technology. The scientific communication goal is:

> Radioactivity is a physical phenomenon whose risks depend on context and exposure, and which also has important roles in medicine, environment, natural processes, astronomy/cosmogenic phenomena, dating, industry and research.

The game should broaden an overly narrow mental model of radioactivity without minimizing real radiological risk.

## Two levels only

### Explorer

Age 14+ / general or non-specialist public.

Expected learning:
- radioactivity can be natural or artificial;
- element and isotope are different concepts;
- basic alpha, beta-minus, beta-plus and electron-capture mechanisms;
- gamma is not simply another name for beta decay;
- decay mode and emitted radiation are not identical concepts;
- half-life is a characteristic decay timescale and can be compared by broad orders/categories;
- PET, SPECT and radionuclide therapy use different nuclear properties;
- radioactivity occurs in medicine, environment, natural background, cosmogenic/astronomical contexts, dating/geoscience, industry and research;
- radiological risk depends on context, pathway and exposure, not a universal `radioactive = deadly` rule;
- external irradiation/exposure does not automatically make a person/object radioactive;
- ordinary approved food irradiation does not make food radioactive under normal food-irradiation conditions;
- formulate useful yes/no classification questions.

Explorer does **not** receive nuclear activation exceptions as routine basic feedback. Scientist may later surface that nuance.

### Scientist

Advanced STEM student or professional. Includes Explorer outcomes plus:
- explicit Z, A, N;
- `N = A - Z`;
- quantitative/logarithmic half-life reasoning;
- more precise nuclear transformations and radiation terminology;
- beta-plus vs electron capture nuance;
- gamma transition nuance;
- PET annihilation mechanism;
- qualitative alpha vs beta-minus therapeutic range/LET reasoning;
- manual elimination as retrieval practice;
- less explicit question scaffolding.

Production reactions and cross sections are a later Scientist extension, not V1.

## Learning must be intrinsic to gameplay

Use evidence created by normal play:
- scientific properties invoked in questions;
- structured classification implied by a question/answer;
- cards selected for elimination;
- consistency/inconsistency of manual elimination;
- guesses;
- occasional prediction;
- structured self-explanation;
- later retrieval/reuse.

Merely seeing information is weak evidence. Correct spontaneous use is strong evidence.

## Event-driven architecture

The Learning Engine consumes semantic gameplay events and must not read arbitrary React component state.

Core events:
- `MATCH_STARTED`
- `QUESTION_ASKED`
- `ANSWER_RECEIVED`
- `CARDS_SELECTED_FOR_ELIMINATION`
- `CARDS_ELIMINATED`
- `GUESS_MADE`
- `MATCH_FINISHED`

Learning-specific events may include:
- `PREDICTION_REQUESTED`
- `PREDICTION_SUBMITTED`
- `SELF_EXPLANATION_REQUESTED`
- `SELF_EXPLANATION_SUBMITTED`
- `FEEDBACK_SHOWN`
- `BOARD_LENS_USED`
- `RETRIEVAL_REQUESTED`
- `RETRIEVAL_SUBMITTED`

The Learning Engine is not the multiplayer authority and Firebase is not the learning event bus.

## Explorer interaction model

Default to automatic/assisted elimination.

Occasionally, when a structured deterministic question is available and the scheduler chooses to intervene:

1. answer is known;
2. before automatic elimination, ask the player to predict which cards are incompatible;
3. compare prediction with deterministic classification;
4. show one concise scientific correction/confirmation;
5. perform the actual automatic elimination.

Do not do this every turn.

## Scientist interaction model

Default to manual elimination.

Manual elimination itself is retrieval practice, so do not insert the Explorer prediction step redundantly.

Allow mistakes during the turn. When deterministic evidence exists, prefer short delayed feedback after the elimination/review phase rather than preventing every error immediately.

## Misconception targets V1

Correct only when gameplay provides evidence relevant to the misconception.

Targets include:
- radioactive = artificial;
- radioactive = automatically/extremely dangerous in every context;
- different isotope = different element;
- longer half-life = always more dangerous;
- beta-plus = gamma;
- PET radionuclide directly emits the detected annihilation photons;
- gamma is equivalent to beta-minus decay;
- irradiation/exposure = contamination;
- irradiation necessarily makes matter/person radioactive.

Explorer correction for irradiation must remain practically precise and simple. Scientist may later receive activation nuance.

## Contextual board lens

If a gameplay question depends on a secondary/supporting property that is hidden in card detail, the UI may expose a temporary board lens across candidate cards.

Examples:
- metal/non-metal;
- chemistry family;
- physical state;
- broad melting-point category.

Lens usage is assistance, not mastery evidence.

Do not use the lens to trivialize central Scientist targets such as decay mode, half-life, Z/A/N or medical application reasoning unless an explicit scaffold rule permits it.

## Question quality

Track two independent dimensions.

### Information value

How well the yes/no question divides the remaining candidate set.

Player-facing qualitative categories:
- very discriminating;
- useful;
- weakly discriminating;
- no discrimination.

No numeric information-gain score is required in the UI.

### Learning value

Whether the question engages a:
- core;
- supporting;
- secondary concept.

Do not combine information value and learning value into an opaque single score.

The information-value metric is a gameplay/process outcome, not a conceptual-test outcome.

## Self-explanation

Occasional structured multiple-choice only.

Example: “Why can this card be eliminated?”

Choices should test the scientific relation generated by the preceding gameplay event. Keep them brief. No free-text LLM evaluation.

## End-of-match recap

Maximum:
- 2–3 concepts actually encountered during the match;
- one optional adaptive deterministic retrieval item.

Do not turn recap into a mandatory mini-exam.

## Product boundaries

Do not add in V1:
- XP;
- streaks;
- badges;
- leaderboards;
- missions/scenarios;
- classroom dashboards;
- account system;
- card/content unlocking;
- production-route training;
- cross-section training;
- free-text LLM grading.
