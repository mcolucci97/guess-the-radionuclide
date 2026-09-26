# Intervention Rules V1

## Global budget

Per normal match:
- maximum 3 in-game interventions;
- target average 1–2;
- zero is allowed;
- end-of-match recap is separate;
- maximum one end-of-match retrieval item.

## Priority order

1. Correct a meaningful misconception exposed by gameplay.
2. Retrieval opportunity for a review-due core concept.
3. Prediction before Explorer automatic elimination.
4. Structured self-explanation.
5. Short question-quality feedback.

Do not fire multiple interventions for the same action.

## Explorer

### Prediction
Eligible when automatic elimination is on, the structured question is reliable, several cards can be meaningfully classified, budget remains, and the same concept is not overused.

Flow:
1. show answer;
2. ask user to tap cards they believe can be eliminated;
3. compare with deterministic engine;
4. short feedback;
5. complete automatic elimination.

### Corrective feedback
One short sentence based on structured scientific data.

### Self-explanation
Multiple-choice only in V1.

## Scientist

No prediction-before-elimination because manual elimination is already the retrieval task.

After the turn:
- detect inconsistent elimination where deterministic;
- provide brief delayed feedback;
- do not immediately prevent every mistake.

Use less explicit scaffolding.

## Contextual board lens

Allowed for secondary/hidden properties. It reveals only the property required for the current question, is temporary, does not automatically close cards, and logs `lens_used` as interface assistance rather than mastery.

## Question-quality feedback

Compute candidate split from structured query.

User-facing categories:
- very discriminating;
- useful;
- weakly discriminating;
- no discrimination.

Learning value remains separate: core / supporting / secondary.

## Recap

Select 2–3 concepts actually encountered, then optionally one deterministic retrieval item. It never changes the match result.
