# Guess the Radionuclide  
### *Indovina il Radionuclide* — an AI-assisted educational card game about radioactivity

<!-- Replace this URL after enabling GitHub Pages -->
[▶ Play online](https://<USERNAME>.github.io/<REPOSITORY>/)

**Guess the Radionuclide** is a digital educational game inspired by the classic deduction format: each player has a secret radionuclide card and must identify the opponent’s card by asking yes/no questions.

Instead of asking only technical questions such as *“Does it decay by alpha emission?”*, players can explore radioactivity through intuitive connections:

- *Is it used in PET imaging?*
- *Is it associated with Fukushima or Chernobyl?*
- *Is it the radionuclide found in smoke detectors?*
- *Is it connected with radioactive bananas?*
- *Can it accumulate in homes?*
- *Is it used to power spacecraft?*
- *Is its element a noble gas, a halogen, or an actinide?*
- *Does its element melt below 30 °C?*

The result is a game designed for both curious beginners and players with a stronger background in nuclear science.

---

## Play the game

Open the web application from the link above. No installation is required.

The game currently includes:

- single-player and local two-player modes;
- cards with educational stories and scientific properties;
- Italian, English and French language support;
- guided or manual card elimination;
- beginner-friendly clues and expert-level properties;
- optional AI-assisted interpretation of naturally phrased questions.

---

## How it works

1. Each player selects a secret radionuclide card.
2. Players take turns asking questions that can be answered with **YES** or **NO**.
3. Based on the answer, incompatible cards are eliminated.
4. The first player to identify the opponent’s radionuclide wins.

The secret card remains hidden during the game: answers are checked internally without exposing the radionuclide name, story or identifying properties.

---

## AI-assisted questions

The AI component is designed for interpretation, not for inventing scientific answers.

A natural-language question such as:

```text
Is it the one used in smoke detectors?
```

is mapped to a controlled game concept:

```text
daily.smoke_detector
```

The final **YES/NO** response is then computed deterministically from the curated radionuclide database.

This architecture allows players to ask creative questions while keeping the game scientifically controlled and fair.

When enabled, the local language-model option runs in the browser on compatible devices. The game also includes a deterministic parser fallback, so the core gameplay does not depend on activating the AI model.

---

## What is on a card?

Depending on the selected level, a radionuclide card can include:

### Basic properties
- radionuclide name and symbol;
- half-life;
- main decay/emission symbols;
- atomic number and mass number.

### Educational context
- medical uses, such as PET, SPECT, therapy or brachytherapy;
- environmental monitoring and nuclear-accident relevance;
- natural radioactivity and everyday-life connections;
- space, industry, archaeology and historical associations.

### Chemistry
- chemical family of the element;
- group and period;
- physical state at room temperature;
- melting point of the element.

### Expert information
- neutron-capture information, when available and explicitly reviewed;
- advanced nuclear-technology context.

Neutron cross sections are treated carefully: they depend on the nuclear reaction and neutron energy. Expert values are therefore displayed only when the corresponding quantity has been defined and curated.

---

## Examples of memorable cards

| Radionuclide | Why players may recognize it |
|---|---|
| **K-40** | Natural potassium, the human body and “radioactive bananas” |
| **Rn-222** | Natural radioactive gas that can accumulate indoors |
| **C-14** | Radiocarbon dating of ancient organic remains |
| **F-18** | FDG-PET medical imaging |
| **Tc-99m** | Hospital scintigraphy and SPECT imaging |
| **I-131** | Thyroid treatment and monitoring after nuclear accidents |
| **Cs-137** | Fallout and environmental/food monitoring |
| **Am-241** | Ionisation smoke detectors |
| **Pu-238** | Radioisotope power for spacecraft and rovers |
| **Fe-60** | Traces of nearby supernovae |
| **Cf-252** | Compact neutron source |

---

## Scientific sources

The educational database is progressively curated using authoritative nuclear-data and scientific-information sources, including:

- [LNHB / DDEP — LARAweb radionuclide data](https://www.lnhb.fr/home/nuclear-data/)
- [IAEA Nuclear Data Services — LiveChart](https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html)
- [IAEA NGATLAS — Atlas of Neutron Capture Cross Sections](https://www-nds.iaea.org/ngatlas2/)
- [IAEA — Nuclear medicine and environmental radioactivity resources](https://www.iaea.org/)
- [WHO — Radon and health](https://www.who.int/news-room/fact-sheets/detail/radon-and-health)
- [Royal Society of Chemistry — Periodic Table](https://periodic-table.rsc.org/)
- [NASA — Radioisotope Power Systems](https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/)

This is an educational game, not a reference tool for radiation-protection, medical or regulatory decisions.

---

## Languages

The interface and educational card content support:

- 🇮🇹 Italiano
- 🇬🇧 English
- 🇫🇷 Français

---

## Credits

**Game conceived and developed by Michele Colucci.**

The digital application is inspired by the original *Indovina il Radionuclide* card-game concept deposited in the INFN Open Access Repository:

- [Original game record — INFN Open Access Repository](https://doi.org/10.15161/oar.it/77027)

---

## About this repository

This repository contains the **compiled static web application** prepared for publication through GitHub Pages.

The development source code, local Node environment and build workflow are maintained separately. The files published here correspond to the production output generated from the app build.

A typical published repository layout is:

```text
/
├── index.html
├── assets/
├── .nojekyll
└── README.md
```

---

## Deployment on GitHub Pages

This section is intended for the repository maintainer.

### 1. Build locally

Before creating the production build, configure the correct Vite base path in the local development project.

For a project page published at:

```text
https://<USERNAME>.github.io/<REPOSITORY>/
```

set:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/<REPOSITORY>/'
})
```

For a user/organisation site such as `https://<USERNAME>.github.io/`, or for a custom domain, use:

```js
base: '/'
```

Then build locally:

```bash
npm run build
```

### 2. Publish only the compiled application

Copy the **contents** of the local `dist/` folder into the root of this GitHub repository:

```text
dist/index.html     → repository root/index.html
dist/assets/        → repository root/assets/
```

Keep this `README.md` in the repository root and add an empty `.nojekyll` file alongside `index.html`.

Do **not** upload the development `src/` folder, `node_modules/` or local configuration files to this deployment repository.

### 3. Enable GitHub Pages

In the GitHub repository:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select the branch containing the compiled files, usually `main`.
4. Select the folder **`/(root)`**.
5. Save and wait for the published-site link to become available.

---

## Status

This project is under active development. The educational database, free-question interpretation and expert-level properties are being progressively extended and reviewed.
