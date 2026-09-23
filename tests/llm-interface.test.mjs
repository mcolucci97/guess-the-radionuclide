import test from 'node:test';import assert from 'node:assert/strict';
import {candidateConcepts,interpretationRequest} from '../src/engine/llm.js';
import {Te} from '../src/engine/advanced.js';
test('LLM can select only retrieved catalogue IDs; no secret enters its prompt',()=>{
 const text='Le trouve-t-on dans les alarmes à fumée ?';const r=interpretationRequest(text,'fr'),schema=JSON.parse(r.response_format.schema),branch=schema.oneOf[1];
 assert.deepEqual(branch.properties.conceptId.enum,candidateConcepts(text).map(x=>x.label));assert(branch.properties.conceptId.enum.every(id=>id in Te));assert.equal(branch.additionalProperties,false);assert.equal(r.messages.length,2);assert.equal(r.messages[1].content,text);assert(!r.messages[0].content.includes('Cs-137'));
});
for(const[lang,text]of[['it','Non lo mettevano negli allarmi per il fumo?'],['en','Was it not used in smoke alarms?'],['fr','Ne le trouve-t-on pas dans les alarmes à fumée ?']])test('Constrained LLM preserves ordinary negation: '+lang,()=>{const schema=JSON.parse(interpretationRequest(text,lang).response_format.schema);assert.equal(schema.oneOf[1].properties.negated.const,true);});
