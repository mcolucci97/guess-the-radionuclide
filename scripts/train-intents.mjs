import fs from 'node:fs';
import {Te,$e} from '../src/engine/legacy.js';
import {features,fit} from '../src/engine/semantic.js';
const rows=[];
const wrappers={it:['{q}','Vorrei sapere: {q}','La mia domanda è: {q}','Mi puoi dire se: {q}'],en:['{q}','I would like to know: {q}','My question is: {q}','Can you tell me: {q}'],fr:['{q}','Je voudrais savoir : {q}','Ma question est : {q}','Pouvez-vous me dire : {q}']};
for(const[id,c]of Object.entries(Te)){if(id.startsWith('identity.')||id.startsWith('time.'))continue;for(const lang of ['it','en','fr'])for(const w of wrappers[lang])rows.push({text:w.replace('{q}',c.label[lang]),label:id,lang});}
for(const[lang,id,text,answer,concept]of $e)if(Te[concept]&&!/\b(non|not|pas)\b/i.test(text))rows.push({lang,text,label:concept});
const creative=[
 ['daily.smoke_detector','it','È la sorgente radioattiva che fa scattare un allarme antincendio?'],['daily.smoke_detector','en','Is it inside an ionisation fire alarm?'],['daily.smoke_detector','fr','Est-il dans une alarme incendie à ionisation ?'],
 ['space.spacecraft_power','it','Fornisce energia ai rover su Marte?'],['space.spacecraft_power','en','Does it provide electricity to a Mars rover?'],['space.spacecraft_power','fr','Fournit-il de l’électricité aux robots sur Mars ?'],
 ['daily.archaeology','it','Aiuta a stabilire quanti anni ha un pezzo di legno antico?'],['daily.archaeology','en','Can it tell the age of ancient wood?'],['daily.archaeology','fr','Permet-il de dater un morceau de bois ancien ?'],
 ['daily.bananas','it','È il responsabile della radioattività delle banane?'],['daily.bananas','en','Is it responsible for banana radioactivity?'],['daily.bananas','fr','Est-il responsable de la radioactivité des bananes ?'],
 ['space.supernova','it','Si trova nelle tracce lasciate da stelle esplose?'],['space.supernova','en','Does it trace exploded stars?'],['space.supernova','fr','Permet-il de retrouver la trace d’étoiles qui ont explosé ?'],
 ['daily.home_radon','it','Può entrare dal terreno e accumularsi in cantina?'],['daily.home_radon','en','Can it seep from the ground into a basement?'],['daily.home_radon','fr','Peut-il entrer depuis le sol et s’accumuler dans une cave ?']
];for(const[label,lang,text]of creative)rows.push({label,lang,text});
const unique=[...new Map(rows.map(x=>[x.lang+'|'+x.text,x])).values()];
fs.writeFileSync('training/train.jsonl',unique.map(x=>JSON.stringify(x)).join('\n')+'\n');
const model=fit(unique);fs.writeFileSync('src/data/intent-model.json',JSON.stringify(model));
const instruction='Translate an Italian, English or French yes/no question into a controlled radionuclide-game concept. Return JSON only, never a scientific answer. Preserve negation; clarify unsupported questions.';
fs.writeFileSync('training/llm-sft.jsonl',unique.map(x=>JSON.stringify({messages:[{role:'system',content:instruction},{role:'user',content:x.text},{role:'assistant',content:JSON.stringify({type:'parsed',queryType:'concept',conceptId:x.label,negated:false})}]})).join('\n')+'\n');
console.log(`${unique.length} labelled questions; ${Object.keys(model.centroids).length} intent centroids fitted. LLM fine-tuning was NOT run.`);
