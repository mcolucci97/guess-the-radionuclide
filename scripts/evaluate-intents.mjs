import fs from 'node:fs';
import model from '../src/data/intent-model.json' with {type:'json'};
import {classify} from '../src/engine/semantic.js';

const corpusPath = process.argv[2] || 'training/parser-corpus-v2.jsonl';
const split = process.argv[3] || 'test';
const MIN_SCORE = Number(process.env.INTENT_MIN_SCORE ?? 0.30);
const MIN_MARGIN = Number(process.env.INTENT_MIN_MARGIN ?? 0.10);

const rows = fs.readFileSync(corpusPath,'utf8').trim().split(/\r?\n/).map(JSON.parse)
  .filter(r => r.split === split)
  .filter(r => r.target?.type === 'parsed' && r.target?.queryType === 'concept');

for (const lang of ['it','en','fr']) {
  const subset = rows.filter(r => r.lang === lang);
  let top1=0, accepted=0, correctAccepted=0, wrongAccepted=0;
  for (const r of subset) {
    const top = classify(r.text, model, 2);
    const correct = top[0]?.label === r.target.conceptId;
    top1 += correct ? 1 : 0;
    const margin = (top[0]?.score ?? 0) - (top[1]?.score ?? 0);
    const accept = (top[0]?.score ?? 0) >= MIN_SCORE && margin >= MIN_MARGIN;
    if (accept) {
      accepted++;
      if (correct) correctAccepted++;
      else wrongAccepted++;
    }
  }
  console.log(lang, {
    n: subset.length,
    top1Accuracy: top1/subset.length,
    coverage: accepted/subset.length,
    precisionWhenAccepted: accepted ? correctAccepted/accepted : 0,
    wrongAccepted
  });
}
