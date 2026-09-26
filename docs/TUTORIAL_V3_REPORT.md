# Tutorial V3 — implementation and validation report

## 1. Base and delivery

Repository: https://github.com/mcolucci97/guess-the-radionuclide

Base branch: `main`  
Base commit: `d8fcc4bc298590bb3aa6bacbde9669a951c4e0e4`  
Validation date: 26 September 2026

The actual repository was cloned and inspected before changes. Learning Engine V1 was already present in `src/learning/`, and normal setup already exposed Explorer and Scientist. The old tutorial was a grid of short text cards using localized copies of legacy SVGs and legacy internal level mappings. Tutorial V3 replaces that renderer, rather than replacing the Learning Engine.

Deliverables:

- `guess-rn-tutorial-v3-delta.zip`: only added/changed repository files, with paths rooted directly at the repository root. **Preferred for manual GitHub upload.**
- `guess-rn-tutorial-v3-complete.zip`: the complete modified source repository, excluding `.git`, installed dependencies, local emulator logs/configuration and generated `dist`.
- This report and machine-readable/test evidence in `docs/tutorial-v3/`.

No remote commits, pushes, publication or Firebase configuration changes were made.

## 2. Files changed

The exact package list is in `docs/TUTORIAL_V3_FILES.txt`.

| Area | Changes |
|---|---|
| `src/App.js` | Replaces the old tutorial renderer with a lazy entry component; tracks whether a scientific level has actually been selected; passes the real card dataset and any selected deck |
| `src/tutorial/` | Entry/error/loading boundary, chapter navigation, reusable visuals, exact scientific models, asset fallback logic, scoped responsive CSS |
| `src/data/tutorial-{it,en,fr}.json` | Versioned V3 curriculum, live-text explanations, labels, alt text, chapter titles and UI strings |
| `tutorial/v3/` | Two optimized neutral WebP illustrations and generation/provenance notes |
| `scripts/build.mjs` | Copies tutorial CSS; retains offline code/text/diagram availability; caches new raster images on demand |
| `scripts/localize-tutorial.py` | Prevents the legacy V2 generator from overwriting V3's independently authored translations |
| `package.json` | Adds tutorial unit and browser test commands; no dependency changes |
| `tests/` | New scientific/content/asset and real-browser tutorial coverage; updates the existing browser tutorial expectations; removes the obsolete V2 circle-count assertion |
| `data/raw/manifest.json` | Reconstructs a missing audit inventory for 87 existing CSVs, without changing their bytes |
| `docs/` | This report, exact changed-file list, test logs/results and four representative screenshots |

### Pre-existing test problems addressed

The baseline regression run had **689 passes and 2 failures out of 691**:

1. `data/raw/manifest.json` was missing. Every existing CSV was compared byte-for-byte with `git show` at the base commit before creating its SHA-256 inventory. The new manifest explicitly records this repository provenance. It does **not** invent an upstream retrieval timestamp or claim fresh IAEA verification.
2. A V2 test expected 14 circles in `half-life.svg`, while the checked-in file contains 17. That obsolete presentation-specific assertion was replaced by meaningful V3 model, data, asset and browser checks. Legacy SVGs remain untouched for compatibility and are no longer used by the tutorial.

## 3. Assets added

| Asset | Size | Dimensions | Purpose |
|---|---:|---|---|
| `tutorial/v3/nucleus.webp` | 22,182 bytes | 1000 × 667 | Intro and conceptual nucleus |
| `tutorial/v3/contexts.webp` | 86,146 bytes | 1200 × 600 | Medicine, earth, laboratory and space contexts |

Total new raster payload: **108,328 bytes (105.8 KiB)**. Generated with the built-in ImageGen tool, then exported as quality-83 WebP. Exact prompts and asset roles are recorded in `tutorial/v3/ASSETS.md`. Neither image contains explanatory prose. The nucleus is a conceptual illustration, not a literal nucleon count. Exact relationships are expressed separately in HTML/SVG.

## 4. Final Explorer chapters

Seven core chapters plus shared final practice:

1. **Una carta, molti indizi** — real K-40 data, element, mass number, half-life, card symbols and context.
2. **Il nucleo dà l’identità** — proton/neutron roles and exact H-1/H-2 comparisons; these examples are explicitly stable.
3. **Come cambia un nucleo** — α, β−, β+, electron capture and γ transition, including the appropriate neutrinos.
4. **Trasformazione ≠ radiazione** — I-131, Tc-99m and F-18/PET.
5. **Metà, poi ancora metà** — expected 8 → 4 → 2 → 1 proportions, exponential curve and time scales.
6. **Un fenomeno, molti contesti** — PET, SPECT, therapy, natural radioactivity, radon/environment, dating/geosciences, industry, research and astronomy/cosmogenic radionuclides.
7. **Esposto non significa contaminato** — exposure, contamination and contextual risk.
8. **Una buona domanda cambia il gruppo** — shared strategy practice.

## 5. Final Scientist chapters

Eight core chapters plus shared final practice:

1. **Tre numeri per un nucleo** — Z, A, N = A − Z; U-235/U-238 from the existing dataset.
2. **Segui A. Segui Z.** — exact ΔA/ΔZ rules and conceptual nucleon reactions.
3. **La particella che completa il conto** — neutrino/antineutrino participation and conservation.
4. **Il tempo di un insieme** — exponential decay, activity, λ, T½ and τ; interactive half-life slider.
5. **Dal nucleo al rivelatore** — nuclear transformation, daughter excitation, de-excitation and secondary processes.
6. **Rivelare. Localizzare. Trattare.** — PET coincidence, SPECT collimation, qualitative α/β− therapy comparison.
7. **Tre fenomeni da separare** — exposure, contamination, activation and contextual risk.
8. **Un indizio chimico, una proprietà nucleare** — chemistry as a supporting deduction property.
9. **Una buona domanda cambia il gruppo** — shared strategy practice.

## 6. Visual architecture and gameplay connection

A small learning badge precedes a large serif title and short subtitle. Each chapter pairs a central scientific visual with 1–3 short text blocks and a gameplay takeaway. Cream, navy, blue, green, coral and restrained violet/gold establish a consistent visual language.

Artwork supplies conceptual context; React/HTML supplies editable text, card properties, equations, isotope notation, particles and callouts. SVG is used for the mathematically computed decay curve, exact annihilation geometry and compact exposure/collimation diagrams. No charting, animation or other dependency was added.

K-40 properties come from the actual `be` dataset passed by the application, including its evaluated half-life display and existing card modes. The example explicitly warns that card icons combine decay modes and associated radiation. U-235/U-238 values are also read from that dataset.

Strategy practice uses the selected game deck when available, otherwise all 59 cards. It computes current yes/no counts for displayed β−/β+ modes, half-life < 1 day, or Z > 20. Choosing a hypothetical answer changes only the tutorial's local candidate list. Counts update with that list; no question receives a hard-coded information-quality label. Reset restores the practice deck.

Tutorial state does not emit learning events, award mastery or modify the game board. The existing in-game Learning Engine remains responsible for predictions, feedback, self-explanation and recaps.

## 7. Responsive behaviour

- Desktop: visual and explanation use two independent columns with readable live text.
- At 700 px and below: visual → explanation → takeaway → navigation stack vertically.
- Intro paths become a single column on narrow phones.
- Formula tiles and level controls reflow when text is enlarged; content is not a scaled-down 16:9 image.
- All 51 localized chapter instances were traversed at **320, 390, 768 and 1440 px**, with no horizontal page overflow.
- 390 px with **200% text** and reduced-motion preference was verified.
- Chapter focus/scroll positioning clears the app's sticky header.

## 8. Localization

`src/data/tutorial-it.json`, `tutorial-en.json` and `tutorial-fr.json` use the same V3 structure:

- `ui`: navigation and introduction;
- `labels`: visual labels, meaningful alt text and captions;
- `paths.explorer.chapters` and `paths.scientist.chapters`: titles, subtitles, concise blocks, takeaway and scene type.

Scientific constants/reactions live once in `src/tutorial/science.js`. Symbols remain the same across languages. The tiny lazy-loading/error UI has a separate trilingual message map in `Entry.jsx`, so it does not require loading all curriculum text before showing a loading message.

Artwork is language neutral. `assetCandidates()` supports optional localized overrides, followed by a neutral fallback. Browser tests force a missing French override and confirm that the neutral image loads. If every image fails, descriptive text remains alongside the exact diagrams and explanations.

## 9. Accessibility

Real text and semantic headings, sections, navigation, figures, labels and native controls are used. Informative raster/SVG visuals have localized alternatives. Particle letters, counts and captions accompany colour coding. Previous/Next have visible labels; progress states include chapter numbers and `aria-current`; path buttons use `aria-pressed`.

Keyboard users can activate all controls. Arrow keys navigate chapters when focus is outside native controls, and changing chapter focuses its heading. The chapter index exposes its expanded state. The half-life slider and strategy selector have explicit labels. Reduced motion is respected; no animation is necessary to understand a process.

Automated browser interaction and visual checks were performed. A screen-reader session and a formal accessibility certification were not performed.

## 10. Scientific corrections

- Radioactive nuclides are distinguished from isotopes in general; H-1/H-2 illustrate stable isotopes.
- γ transitions preserve A/Z and change nuclear energy state.
- Decay mode is distinguished from associated radiation and later processes.
- I-131 is shown as `¹³¹I → ¹³¹Xe* + e− + ν̄e`, followed separately by `¹³¹Xe* → ¹³¹Xe + γ` for the illustrated excited-daughter route.
- Tc-99m is described as an isomeric transition, with γ emission or internal conversion.
- Half-life describes an ensemble expectation, not a scheduled decay time for every nucleus or disappearance of matter.
- Scientist explicitly distinguishes activity A(t) from mass number A; the displayed exponential model assumes one radionuclide, constant λ and no production/parent feeding.
- Natural radioactivity describes origin; environmental radioactivity/monitoring describes presence and measurement, including artificial radionuclides.
- Chemical family does not determine decay mode. Isotope effects are acknowledged without making chemistry a central mastery target.
- No detailed Auger therapy requirement was introduced. Atomic relaxation is mentioned briefly in Scientist's emission chapter.

## 11. Exact treatment of neutrinos

Every V3 transformation model carries the correct lepton:

| Process | Conceptual reaction | Nuclear change |
|---|---|---|
| β− | `n → p + e− + ν̄e` | A unchanged, Z + 1 |
| β+ | `p → n + e+ + νe` | A unchanged, Z − 1 |
| EC | `p + e− → n + νe` | A unchanged, Z − 1 |

Explorer names the electron antineutrino for β− and electron neutrino for β+/EC. Scientist relates them to energy, momentum, angular momentum and lepton-number conservation, with a concise lepton-number example for each reaction. Nuclear recoil and sharing of available energy are acknowledged.

These are explicitly nucleon-level conceptual sketches. The tutorial states that actual energetics depend on nuclear masses/states, and that a free proton does not spontaneously undergo β+ decay. Neutrinos are not added as a practical gameplay property.

## 12. PET treatment

The F-18 **β+ branch** is shown as `¹⁸F → ¹⁸O + e+ + νe`. A separate step slows the positron in matter. A third step shows `e+ + e− → 2γ` and, for two-photon annihilation at rest, two photons of approximately 511 keV in nearly opposite directions. Scientist adds coincidence detection.

All three languages and visuals distinguish annihilation photons from primary nuclear gamma emission by F-18. This is explicitly a β+ branch illustration, not a claim that all F-18 decays have that mode. The two-photon-at-rest qualifier avoids implying that every annihilation channel has precisely this geometry.

## 13. Irradiation, contamination and activation

Explorer separates receipt of ionizing radiation from the presence of radioactive material on or within a person/object. The PET-neighbour example explains that being near a patient does not make another person radioactive. Activation is not part of Explorer's basic correction.

Scientist adds that suitable nuclear reactions induced by appropriate particles or sufficiently energetic photons can create radioactive nuclei. Radiation/projectile type, energy, target nuclide and reaction probability are distinct considerations. Ordinary diagnostic exposure is not presented as commonly activating people or objects.

Risk remains contextual: radionuclide/activity, radiation/energy, dose, duration, distance, internal/external route, intake and biological distribution. No assertion that radioactive material is categorically safe or dangerous, or that low energy alone makes it safe, is used.

## 14. Tests executed

Environment: Node 24.19.0, installed locked npm dependencies, Chromium 140 / Playwright 1.55.1, Firebase Auth and RTDB emulators with the production SDK and actual security rules. The existing GitHub Actions workflow remains on Node 22.

| Command / suite | Exact final result |
|---|---|
| `node --test --test-reporter=tap tests/*.test.mjs` (same tests as `npm test`) | **704 passed, 0 failed, 0 skipped** |
| `npm run test:tutorial` | **14 passed, 0 failed**; included in the 704 total |
| `npm run test:tutorial:e2e` / `node tests/browser-tutorial.mjs` | **13 check groups passed**, 0 page errors |
| `npm run test:e2e` | **11 check groups passed**, 0 page errors; solo, local, offline, language switching and fallback covered |
| `npm run test:learning:e2e` | **5 check groups passed**, 0 page errors, no external requests |
| `npm run test:rules` | **7 passed, 0 failed**; expected permission-denied messages come from negative security tests |
| `npm run test:online` | **9 check groups passed**, 0 page errors; three identities, turns, assistance, predictions, reconnection, guesses and languages |
| `npm run build` | **Passed**, final production mode; relative GitHub Pages paths and offline cache generated |
| `git diff --check` | **Passed** |
| Protected source comparison | `src/learning/`, `src/multiplayer/`, `src/engine/`, existing scientific datasets, Firebase rules/config and Pages workflow unchanged |
| `npm run test:llm` | **Blocked at prerequisite**: exported model weights/`ndarray-cache.json` absent from the repository |
| `python3 tests/offline-kit-smoke.py` | **Blocked at prerequisite**: Python `torch` absent; unrelated training workflow not executed |

## 15. Evidence and final audit

`docs/tutorial-v3/` contains the complete final unit-test TAP, production build output, tutorial/game/learning/online JSON results, Firebase rules log, online browser log, prerequisite errors for the two LLM-only tests, and screenshots:

- `entry-desktop.png`
- `explorer-desktop.png`
- `scientist-desktop.png`
- `pet-mobile.png`

The browser checks traverse every chapter in every language, validate neutrino/PET formulas, exercise Previous/Next/index/keyboard navigation, calculate strategy splits, test missing assets, verify no research/Firebase tutorial traffic or Learning Engine profile mutations, and reload tutorial text/diagrams/visited artwork offline.

Final scientific audit reviewed the V3 JSONs, `science.js` and all rendered transformation/PET/risk scenes. β− retains ν̄e; β+/EC retain νe; F-18's nuclear step and annihilation are separate; risk wording is contextual. The original unused V2 asset collection remains for compatibility and is not the scientific source used by V3.

The new tutorial chunk is about **78.5 KiB uncompressed**; the main entry is about **323 KiB**. The existing large WebLLM dependency remains in its existing separate chunk. New WebP images are requested after tutorial entry, loaded lazily and cached when viewed. Code, text, exact diagrams and CSS retain offline precaching. Unvisited artwork can fall back to its descriptive text offline.

Reference resources checked for the tutorial's physical distinctions:

- [IAEA, Nuclear Medicine Physics](https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1617web-1294055.pdf)
- [IAEA, PET and PET/CT systems](https://www-pub.iaea.org/MTCD/publications/PDF/Pub1393_web.pdf)
- [CDC, Radiation Contamination Versus Exposure](https://www.cdc.gov/radiation-emergencies/infographic/contamination-versus-exposure.html)
- [NRC, Activation](https://www.nrc.gov/reading-rm/basic-ref/glossary/activation)
- [CERN, The puzzle of neutrinos, seventy years on](https://home.cern/the-puzzle-of-neutrinos-seventy-years-on/)

Card values are sourced from the repository, not replaced with new online values.

## 16. Deferred work and limits

No requested tutorial chapter is deferred. Real generative LLM inference and the offline training smoke test remain unverified for the explicit prerequisites above; deterministic parser, LLM interface/lazy-loading guards and missing-model fallback are covered by the passing regression/browser suites. No weights or unrelated training dependencies were added.

Production Firebase was not contacted; online checks used real SDK/rules against emulators. No manual screen-reader, physical-device or cross-browser Safari/Firefox session was performed. GitHub publication remains the user's upload action.

## Manual GitHub upload

1. Extract **`guess-rn-tutorial-v3-delta.zip`**.
2. Open the repository root on GitHub and use **Add file → Upload files**.
3. Upload the extracted files and folders **at the repository root**, preserving their paths. Do not upload the ZIP itself or an extra enclosing folder.
4. Commit the upload. The existing Pages workflow installs dependencies and builds the source automatically.

There are no required deletions and no Firebase configuration migration. The delta targets the base commit above; if you have independently changed the same files since that commit, compare those changes before overwriting them.
