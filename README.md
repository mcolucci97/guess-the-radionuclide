# Parser V2 integration patch

This bundle is ready to copy into the repository root.

## What changes

- `training/parser-corpus-v2.jsonl`: 3252 multilingual examples
  - original 3000 corpus
  - +252 hard examples targeted at confusion pairs
- `src/data/intent-model.json`: retrained TF-IDF character-trigram intent model
- `scripts/train-intents.mjs`: reproducible training from the corpus
- `scripts/evaluate-intents.mjs`: per-language evaluation
- `tests/intent-corpus.test.mjs`: regression tests
- `patches/advanced-threshold.patch`: changes semantic fallback from score/margin 0.83/0.15 to 0.30/0.10

## Validation / held-out test

Thresholds were selected on validation only.

Held-out test semantic fallback at score >= 0.30 and margin >= 0.10:

- IT: top-1 96.1%, coverage 88.3%, accepted precision 100%
- EN: top-1 93.5%, coverage 84.4%, accepted precision 100%
- FR: top-1 97.4%, coverage 79.2%, accepted precision 100%

The deterministic parser still runs first. The semantic classifier is only a fallback for otherwise unknown questions.

## Commands

After copying the files and applying the patch:

```bash
npm run train
npm test
npm run build
node scripts/evaluate-intents.mjs training/parser-corpus-v2.jsonl test
```
