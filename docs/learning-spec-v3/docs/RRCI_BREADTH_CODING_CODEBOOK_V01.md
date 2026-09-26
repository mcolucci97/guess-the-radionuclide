# RRCI breadth-of-radioactivity coding codebook V0.1

Applies to E40 and any parallel open item.

## Prompt

“Scrivi fino a cinque contesti, fenomeni o applicazioni nei quali la radioattività può essere presente, importante o utilizzata.”

Code each scientifically interpretable response into one or more predefined categories. Keep the original response. Do not infer a category that is not supported by the participant's wording.

## Categories

### 1. danger_accidents
Examples: Chernobyl, Fukushima, contamination accident, radioactive release.

This category is not negative-scored. It represents a legitimate context.

### 2. weapons
Examples: atomic bomb, nuclear weapon, fallout from weapons testing.

### 3. energy
Examples: nuclear power plant, reactor electricity production.

### 4. medicine
Examples: PET, SPECT, scintigraphy, radiotherapy, radionuclide therapy, diagnostic tracers.

If the answer only says “hospital” or “medicine”, code medicine if the intended radioactive/radiation context is clear.

### 5. environment
Examples: environmental monitoring, radioactive contamination in soil/water, tracing environmental processes, fallout monitoring.

**Keep separate from natural radioactivity.** “Pollution in a river” belongs here even if the participant does not recognize natural radionuclides.

### 6. natural_radioactivity
Examples: radon from rocks/soil, K-40 in the body/food, uranium/thorium in rocks, natural background radioactivity.

**Keep separate from environment.** The construct is recognition that radioactivity exists naturally, not simply that radionuclides can be measured outdoors.

### 7. astronomy_cosmogenic
Examples: cosmogenic radionuclides, cosmic-ray production of radionuclides, radionuclides/decay used in astrophysics or astronomy.

Do not code a generic mention of “space radiation” here unless radioactivity/radionuclides are part of the response.

### 8. dating_geoscience
Examples: carbon-14 dating, geological dating using radioactive decay, age determination of rocks/materials.

### 9. industry
Examples: thickness/level gauges using radionuclides, industrial tracers, sterilization by radiation where framed as an application of radiation/radionuclides, non-destructive testing using radioactive sources.

### 10. scientific_research
Examples: radioactive tracers in research, nuclear-physics experiments, research radionuclides, laboratory tracing.

## Additional flags

For every response unit record:
- `scientifically_correct` yes/no/ambiguous;
- `specificity` generic/specific;
- `misconception_flag` if the wording contains a scientifically meaningful misconception;
- `notes`.

## Scoring

`BreadthScore` = number of distinct scientifically correct categories present (0–10), not number of examples.

Also retain:
- each category binary present/absent;
- number of correct examples;
- number of incorrect/ambiguous examples;
- number of responses provided (0–5).

Do not treat danger/accidents, weapons or energy as undesirable. The study asks whether the representation becomes broader, not whether legitimate risk associations disappear.

## Multi-category examples

“Radon nelle case” -> `natural_radioactivity`; optionally also `environment` only if the response explicitly frames environmental measurement/exposure.

“Contaminazione del suolo dopo un incidente” -> `environment` + `danger_accidents`.

“Carbonio-14 prodotto dai raggi cosmici per datare reperti” -> `astronomy_cosmogenic` + `dating_geoscience`.

“PET per diagnosticare tumori” -> `medicine` only.

## Reliability

Before main analysis, two independent coders should code at least a substantial pilot subset. Report agreement per category and resolve ambiguous examples into a maintained coding manual. Do not automate free-text coding before a human-coded reference set exists.
