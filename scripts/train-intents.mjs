import fs from 'node:fs';
import {fit} from '../src/engine/semantic.js';

const corpusPath = process.argv[2] || 'training/parser-corpus-v2.jsonl';
const rows = fs.readFileSync(corpusPath,'utf8').trim().split(/\r?\n/).map(JSON.parse);

const train = rows
  .filter(r => r.split === 'train')
  .filter(r => r.target?.type === 'parsed' && r.target?.queryType === 'concept')
  .map(r => ({text:r.text, label:r.target.conceptId, lang:r.lang}));

const model = fit(train);
model.version = 2;
model.corpus = 'parser-corpus-v2';
fs.writeFileSync('src/data/intent-model.json', JSON.stringify(model));

const byLang = Object.fromEntries(['it','en','fr'].map(lang => [
  lang, train.filter(r => r.lang === lang).length
]));
console.log(`Intent model trained on ${train.length} examples / ${Object.keys(model.centroids).length} intents`);
console.log(byLang);
