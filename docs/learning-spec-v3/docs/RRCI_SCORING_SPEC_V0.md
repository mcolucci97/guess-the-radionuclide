# RRCI scoring specification V0

**Provisional. Final scoring must follow item validation and calibration.**

## 1. Do not use one total score as the only outcome

The RRCI is intentionally multidimensional. The primary study should preserve at least two separate primary outcomes:

### ConceptualCoreScore
Conceptual understanding of:
- natural/artificial radioactivity;
- isotope/nuclide identity;
- irradiation/contamination and radioactivity/radiation distinction;
- half-life;
- decay/radiation distinction;
- basic PET/SPECT/therapy concepts.

### TransferScore
Items in which the participant must apply a principle to a new radionuclide/scenario rather than recall a named card.

Candidate transfer items in V0:
- E17
- E23
- E24/E25 when used in scenario form
- E29
- E38
- E39
- S09
- S12

The final transfer set must be balanced after pilot difficulty analysis.

## 2. Misconception profile

Treat misconceptions as categorical/transition outcomes, not as a single additive 'misconception percentage'.

Candidate mappings:

| Misconception | Candidate evidence |
|---|---|
| radioactivity is artificial-only | E01, E02, E30, E32, E35 |
| irradiation = contamination | E06, E07, E08, E09 |
| radiation accumulates in matter | E05, E06, E08, E09 |
| irradiation always makes matter radioactive | E08, E10 |
| radioactivity always extremely dangerous | E11, E16, E32 |
| longer half-life = more dangerous | E11, E16, S09 |
| isotope = different element | E03, E04, S02 |
| gamma is equivalent to a particle decay mode | E22, E23, S07 |
| beta+ / PET photons / gamma are the same process | E24, E26, S11 |
| half-life is linear / all gone after T½ | E12, E13, E14 |

For each misconception, classify pre/post evidence only after calibration determines which items are sufficiently diagnostic.

Suggested transition reporting:
- misconception-consistent -> scientifically consistent
- scientifically consistent -> scientifically consistent
- misconception-consistent -> misconception-consistent
- scientifically consistent -> misconception-consistent
- indeterminate (mixed responses)

Do not force a binary status if responses are internally inconsistent.

## 3. Two-tier scoring

For two-tier diagnostic items, retain both tiers.

Suggested interpretation:
- Tier 1 correct + Tier 2 correct = strong evidence of understanding
- Tier 1 correct + Tier 2 incorrect = possible guess / fragile knowledge
- Tier 1 incorrect + Tier 2 misconception-consistent = diagnostic misconception evidence
- other combinations = uncertain / partial

Do not simply award two independent points and call the result 'mastery'.

## 4. Breadth of radioactivity representation

E40 is scored separately.

Predefine categories before main data collection:
- danger/accidents
- weapons
- energy
- medicine
- environment
- natural radioactivity
- astronomy/cosmogenic
- dating/geoscience
- industry
- scientific research

Record at least:
- number of distinct scientifically correct categories (`BreadthScore`);
- each category as present/absent;
- number/type of scientifically incorrect associations;
- number of responses supplied (0–5).

Do **not** score awareness of danger as a negative category. The desired change is broader scientific representation, not removal of legitimate hazard awareness.

For qualitative coding, define a codebook and assess inter-rater agreement on at least a substantial subset before using automated classification.

## 5. Risk-context reasoning

Candidate items:
- E06–E11
- E16
- S09

The construct is contextual reasoning, not pro-nuclear sentiment or reduced fear.

No item asking whether 'nuclear power is good/bad' belongs in the learning score.

## 6. Scientific-questioning outcome

Candidate test items:
- E36
- E37

More importantly, derive process outcomes from actual gameplay:
- mean/median information value per interpretable question;
- proportion of high-discrimination questions;
- candidate reduction per question;
- concept diversity of questions;
- spontaneous use of core concepts;
- change over turns/session.

Keep mathematical information value separate from pedagogical learning value.

## 7. Scientist extension

Report separately:
- ScientistNuclearStructureScore: S01–S07
- ScientistQuantitativeScore: S08–S10
- ScientistMedicalPhysicsScore: S11–S12

Only collapse into an overall Scientist extension score if dimensionality/reliability evidence supports that interpretation.

## 8. Missing / 'I don't know'

The V0 MCQs do not include a forced 'I don't know' option.

During cognitive interviews and pilot, measure confidence separately where useful. If guessing appears substantial, consider confidence only on selected diagnostic/two-tier items rather than every item to keep burden low.

Unanswered items remain missing; do not automatically score them as a demonstrated misconception.

## 9. Primary trial analysis

Prefer a model that adjusts for baseline rather than normalized gain as the only outcome.

Examples:

`post ~ group + pre + baseline_covariates + (1 | class)`

or longitudinal mixed model:

`score ~ time * group + (1 | participant) + (1 | class)`

If classes are randomized, class/school clustering must be handled in design and analysis.

Report effect estimates and confidence intervals, not only p-values.
