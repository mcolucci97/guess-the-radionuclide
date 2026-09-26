# Tutorial V2 — upload package

This package is designed to be copied over the repository root.

It contains:
- `tutorial/`: replacement SVG tutorial graphics in IT/EN/FR plus root fallback.
- `src/data/tutorial-it.json`
- `src/data/tutorial-en.json`
- `src/data/tutorial-fr.json`

The active normal product model remains Explorer/Scientist. Internally the current app
maps Explorer -> legacy `intermediate` and Scientist -> legacy `expert`, so the JSON
keeps those compatibility keys.

Scientific note: beta-decay graphics explicitly include neutrinos:
- β−: n → p + e− + ν̄e
- β+: p → n + e+ + νe
- electron capture: p + e− → n + νe
