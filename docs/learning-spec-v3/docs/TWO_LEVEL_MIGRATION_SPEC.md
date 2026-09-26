# Two-level migration specification

## Goal

Reduce setup choice overload. The normal V1 experience exposes only two scientific depth/learning choices:

- `explorer`
- `scientist`

There must not be a second visible Base / Intermediate / Expert selector.

## User-facing semantics

### Explorer

General 14+ science-communication profile.

Includes:
- radioactivity as physical/natural and artificial phenomenon;
- element vs isotope;
- very basic mechanisms of alpha, beta-minus, beta-plus and electron capture;
- gamma radiation/transition concept at appropriate qualitative depth;
- decay mode vs emitted radiation;
- half-life scales and comparisons;
- PET, SPECT, therapy conceptually;
- environment and radon;
- natural radioactivity as a distinct breadth category;
- astronomy/cosmogenic contexts;
- dating/geoscience;
- industry and research;
- contextual risk reasoning;
- irradiation vs contamination/exposure at a practical level;
- yes/no classification and discriminating questions.

Explorer may use automatic card elimination and occasional prediction scaffolding.

### Scientist

Everything in Explorer plus:
- explicit Z, A, N;
- `N = A - Z`;
- quantitative/log-scale half-life reasoning;
- more rigorous nuclear transformations;
- beta-plus vs electron capture nuance;
- gamma transition nuance;
- PET annihilation mechanism;
- qualitative alpha vs beta-minus therapeutic reasoning;
- manual card elimination;
- less scaffolding/fading hints.

Production routes and cross sections remain outside V1.

## Backward compatibility

Current multiplayer rooms and Firebase rules use legacy `level` values.

Introduce pure adapter functions such as:

```js
learningLevelFromLegacy(level) {
  if (level === 'expert') return 'scientist';
  return 'explorer'; // base + intermediate
}

legacyLevelForOnline(learningLevel) {
  return learningLevel === 'scientist' ? 'expert' : 'intermediate';
}
```

Exact names may differ.

For old saved state:
- `base` -> `explorer`
- `intermediate` -> `explorer`
- `expert` -> `scientist`

For new online room serialization:
- `explorer` -> `intermediate`
- `scientist` -> `expert`

This avoids a Firebase rules migration during Learning V1.

## Audience simplification

The normal V1 target is 14+.

Do not require a separate Child/Adult choice in the standard setup. Preserve child assets/legacy handling if useful, but default normal play to the existing adult/14+ content path.

Do not delete child content merely to simplify the UI; hide/defer it until a dedicated children version is designed.

## Assistance relationship

Avoid asking users to make redundant choices.

Preferred defaults:
- Explorer -> assisted/automatic elimination;
- Scientist -> manual elimination.

If an assistance override is retained for debugging/accessibility, it should be secondary/advanced, not a prominent third decision in normal setup.

## Modes

Do not conflate game mode and learning level. Solo/local/online remain gameplay choices; Explorer/Scientist controls scientific depth/scaffolding.
