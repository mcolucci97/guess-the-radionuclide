import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import model from '../src/data/intent-model.json' with {type:'json'};
import {classify} from '../src/engine/semantic.js';
import {ze} from '../src/engine/advanced.js';

const rows = fs.readFileSync('training/parser-corpus-v2.jsonl','utf8')
  .trim().split(/\r?\n/).map(JSON.parse);

const MIN_SCORE=.30, MIN_MARGIN=.10;

test('multilingual semantic fallback remains precise on untouched test split',()=>{
  const testRows=rows.filter(r=>r.split==='test' && r.target?.type==='parsed' && r.target?.queryType==='concept');
  for(const lang of ['it','en','fr']){
    const subset=testRows.filter(r=>r.lang===lang);
    let top1=0, accepted=0, correctAccepted=0;
    for(const r of subset){
      const top=classify(r.text,model,2);
      const correct=top[0]?.label===r.target.conceptId;
      top1+=correct?1:0;
      const margin=(top[0]?.score||0)-(top[1]?.score||0);
      if((top[0]?.score||0)>=MIN_SCORE && margin>=MIN_MARGIN){
        accepted++;
        correctAccepted+=correct?1:0;
      }
    }
    assert(top1/subset.length >= .90, `${lang}: top-1 below 90%`);
    assert(accepted/subset.length >= .75, `${lang}: coverage below 75%`);
    assert(correctAccepted/accepted >= .98, `${lang}: accepted precision below 98%`);
  }
});

test('natural French questions are parsed',()=>{
  const cases=[
    ["Est-ce qu’il est utilisé en médecine nucléaire ?","medical.hospital"],
    ["Peut-on l’utiliser en TEP ?","medical.pet"],
    ["Est-ce qu’il se désintègre par alpha ?","physics.alpha"],
    ["Est-ce qu’il est naturel ?","nature.natural"],
    ["Émet-il des positons ?","physics.beta_plus"],
    ["Est-il utilisé en TEMP ?","medical.spect"],
    ["Est-ce un métal ?","chemistry.metal"],
    ["Peut-il servir d’horloge naturelle ?","earth.dating"],
  ];
  for(const [q,id] of cases){
    const parsed=ze(q,'fr');
    assert.equal(parsed.type,'parsed',q);
    assert.equal(parsed.conceptId,id,q);
  }
});
