import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TRANSFORMATIONS,PET_DECAY,ANNIHILATION,remainingFraction,STRATEGIES,matchesStrategy} from '../src/tutorial/science.js';
import {TUTORIAL_ASSETS,assetCandidates} from '../src/tutorial/assets.js';
import {be,xe} from '../src/engine/advanced.js';
const content=Object.fromEntries(['it','en','fr'].map(l=>[l,JSON.parse(fs.readFileSync(`src/data/tutorial-${l}.json`))]));
const expected={explorer:['card','isotopes','transformations','emissions','half-life','contexts','risk','strategy'],scientist:['zan','transformations','neutrinos','exponential','emissions','medicine','risk','chemistry','strategy']};
for(const [lang,data] of Object.entries(content)){
 test(`${lang}: exactly two complete V3 paths, stable chapter order and no legacy choices`,()=>{
  assert.equal(data.version,3);assert.deepEqual(Object.keys(data.paths),['explorer','scientist']);
  for(const [level,ids] of Object.entries(expected)){
   assert.deepEqual(data.paths[level].chapters.map(c=>c.id),ids);
   for(const c of data.paths[level].chapters){assert(c.title&&c.subtitle&&c.takeaway);assert(c.blocks.length>=1&&c.blocks.length<=3);for(const b of c.blocks)assert(b.title&&b.text);}
  }
  assert.deepEqual(Object.keys(data.ui),Object.keys(content.en.ui));assert.deepEqual(Object.keys(data.labels),Object.keys(content.en.labels));
 });
 test(`${lang}: scientific language retains neutrinos, PET stages and statistical half-life`,()=>{
  assert(data.labels.minusNote&&data.labels.plusNote&&data.labels.captureNote);
  assert(data.labels.reactionNote);assert(data.labels.photons.includes('511'));assert(data.labels.ensemble.includes('8'));
  assert(data.labels.formulaNote.includes('A(t)'));assert.equal(data.paths.explorer.chapters.find(c=>c.id==='contexts').contexts.length,9);
 });
}
test('Beta and EC models carry the correct lepton and Z/A change',()=>{
 const by=Object.fromEntries(TRANSFORMATIONS.map(t=>[t.id,t]));
 assert.equal(by.minus.equation,'n → p + e− + ν̄e');assert.equal(by.minus.deltaZ,1);
 assert.equal(by.plus.equation,'p → n + e+ + νe');assert.equal(by.plus.deltaZ,-1);
 assert.equal(by.capture.equation,'p + e− → n + νe');assert.equal(by.capture.deltaZ,-1);
 for(const id of ['minus','plus','capture','gamma'])assert.equal(by[id].deltaA,0);
 assert.equal(by.alpha.deltaA,-4);assert.equal(by.alpha.deltaZ,-2);assert.equal(by.gamma.deltaZ,0);
});
test('PET decay and annihilation are separate stages',()=>{
 assert.equal(PET_DECAY,'¹⁸F → ¹⁸O + e+ + νe');assert(!PET_DECAY.includes('γ'));assert.equal(ANNIHILATION,'e+ + e− → 2γ');
});
test('Decay fractions are exponential; half-life differs from mean life',()=>{
 assert.deepEqual([0,1,2,3].map(remainingFraction),[1,.5,.25,.125]);
 assert(Math.abs(remainingFraction(1/Math.LN2)-1/Math.E)<1e-12);
});
test('Anchor properties come from the existing dataset',()=>{
 assert.equal(xe['K-40'].A,40);assert.equal(xe['K-40'].Z,19);assert.equal(xe['K-40'].nuclear.halfLifeDisplay,'1.248E+9 Y');
 assert.equal(xe['U-235'].A-xe['U-235'].Z,143);assert.equal(xe['U-238'].A-xe['U-238'].Z,146);
});
test('Every referenced neutral/optional localized image exists; artwork is small',()=>{
 let size=0;
 for(const asset of Object.values(TUTORIAL_ASSETS))for(const src of new Set(['it','en','fr'].flatMap(l=>assetCandidates(asset,l))))size+=fs.statSync(src).size;
 assert(size<150*1024);
});
test('Missing localized artwork resolves to neutral; missing all candidates is safe',()=>{
 assert.deepEqual(assetCandidates(TUTORIAL_ASSETS.nucleus,'fr'),['./tutorial/v3/nucleus.webp']);
 assert.deepEqual(assetCandidates({localized:{fr:'fr/nucleus.webp'},neutral:'nucleus.webp'},'fr'),['./tutorial/v3/fr/nucleus.webp','./tutorial/v3/nucleus.webp']);
 assert.deepEqual(assetCandidates(undefined,'it'),[]);
});
test('Strategy partitions use the remaining deck, including one-sided splits',()=>{
 for(const q of STRATEGIES){const yes=be.filter(c=>matchesStrategy(c,q)),no=be.filter(c=>!matchesStrategy(c,q));assert.equal(yes.length+no.length,be.length);assert(yes.length&&no.length);assert.equal(yes.filter(c=>matchesStrategy(c,q)).length,yes.length);assert.equal(yes.filter(c=>!matchesStrategy(c,q)).length,0);}
 assert.equal(matchesStrategy(xe['F-18'],'betaPlus'),true);assert.equal(matchesStrategy(xe['K-40'],'betaPlus'),false);
});
test('Tutorial has no research transport, Firebase or gameplay mutation dependency',()=>{
 for(const file of fs.readdirSync('src/tutorial').filter(x=>/\.(jsx|js)$/.test(x))){const code=fs.readFileSync('src/tutorial/'+file,'utf8');assert(!/from\s+['"].*(?:firebase|researchTransport|useLearning|learning\/engine)/.test(code),file);assert(!/fetch\(|sendBeacon\(|localStorage\.(?:setItem|removeItem)/.test(code),file);}
});
