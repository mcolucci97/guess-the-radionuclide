import {chromium,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {be,xe,Ge,We,ze} from '../src/engine/advanced.js';
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');let p=url.pathname.replace(/^\/guess-the-radionuclide/,'');if(p.endsWith('/'))p+='index.html';
 const file=path.resolve('dist','.'+decodeURIComponent(p));if(!file.startsWith(path.resolve('dist')+path.sep))throw Error();
 res.setHeader('Content-Type',({html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',webmanifest:'application/manifest+json'})[file.split('.').pop()]||'application/octet-stream');res.end(await fs.readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(4176,'127.0.0.1',r));
const browser=await chromium.launch({headless:true}),base='http://127.0.0.1:4176/guess-the-radionuclide/';
const contexts=[],errors=[],requests=[],checks=[];
const click=(p,name)=>p.getByRole('button',{name,exact:true}).click();
const card=(p,id)=>p.locator(`[data-card-id="${id}"]`);
const downIds=p=>p.locator('[data-card-id].opacity-40').evaluateAll(els=>els.map(e=>e.dataset.cardId));
const profile=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('rn-learning-v1:primary')));
async function page(){const c=await browser.newContext({viewport:{width:390,height:844}});contexts.push(c);const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith(base))requests.push(r.url());});await p.goto(base);await click(p,'English');return p;}
async function start(p,level='explorer'){await click(p,'Play');await p.locator(`[data-learning-level="${level}"]`).click();await click(p,'Solo · challenge');await click(p,'All');await click(p,'Start match');await card(p,'H-3').getByRole('button').first().click();await p.getByRole('textbox').waitFor();}
async function ask(p,text){await p.getByRole('textbox').fill(text);await click(p,'Ask');await click(p,'Yes, ask this');await p.getByText('Answer',{exact:true}).waitFor();}
async function answer(p){return (await p.locator('aside p.text-6xl').innerText())==='YES';}
async function dismiss(p){const panel=p.getByTestId('learning-panel');if(!await panel.count())return;for(const label of ['Continue without practice','Continue','Close'])if(await panel.getByRole('button',{name:label,exact:true}).count()){await panel.getByRole('button',{name:label,exact:true}).click();break;}}
async function computer(p){const heading=p.getByRole('heading',{name:'Computer asks:',exact:true});await expect(heading.or(p.getByTestId('learning-recap'))).toBeVisible();if(!await heading.count())return;const question=await heading.locator('..').locator('p.bg-blue-50').innerText();const a=We(xe['H-3'],question,'en');await click(p,a.type==='ok'?(a.yes?'YES':'NO'):question.includes(xe['H-3'].name.en)?'YES':'NO');await expect(p.getByRole('button',{name:'Make a guess',exact:true}).or(p.getByTestId('learning-recap'))).toBeVisible();}
try {
 const p=await page();await click(p,'Play');assert.deepEqual(await p.locator('[data-learning-level]').evaluateAll(e=>e.map(x=>x.dataset.learningLevel)),['explorer','scientist']);
 for(const label of ['Base','Intermediate','Expert','Children','Adult'])assert.equal(await p.getByRole('button',{name:label,exact:true}).count(),0);
 for(const language of ['Italiano','Français','English']){await click(p,language);assert.equal(await p.locator('[data-learning-level]').count(),2);}
 await p.goto(base);await click(p,'English');await start(p);
 await ask(p,'Does it emit positrons?');await expect(p.getByTestId('prediction-cards')).toBeVisible();await expect(p.getByRole('button',{name:'Finished · next turn',exact:true})).toBeDisabled();assert.deepEqual(await downIds(p),[]);
 const yes=await answer(p),query=ze('Does it emit positrons?','en');const expected=be.filter(c=>Ge(c,query,'en').yes!==yes).map(c=>c.id);
 for(const id of expected)await p.getByTestId('prediction-cards').getByRole('button',{name:id,exact:true}).click();
 await click(p,'Compare');assert.deepEqual((await downIds(p)).sort(),expected.sort());assert((await p.getByTestId('learning-panel').innerText()).includes('matches the properties'));
 let saved=await profile(p);assert.equal(saved.activeMatch.budget.used,1);assert.equal(saved.concepts['decay.beta_plus'].assistedSuccesses,1);
 await p.screenshot({path:'docs/screenshots/learning-explorer-phone.png',fullPage:true});
 await p.getByTestId('learning-panel').screenshot({path:'docs/screenshots/learning-explorer-panel.png'});
 checks.push('Only Explorer/Scientist in IT/EN/FR; prediction precedes filtering and is graded against deterministic card properties');
 await click(p,'Finished · next turn');await computer(p);
 // Finish through normal game controls. Honest answers let the challenge computer deduce H-3.
 for(let i=0;i<12&&!await p.getByTestId('learning-recap').count();i++){
  await click(p,'Make a guess');await card(p,'F-18').getByRole('button').first().click();await computer(p);
 }
 await expect(p.getByTestId('learning-recap')).toBeVisible();assert((await p.getByTestId('learning-recap').locator('li').count())<=3);
 assert.equal(await p.getByTestId('learning-recap').locator('details').count(),1);
 await p.getByTestId('learning-recap').locator('summary').click();await p.getByTestId('learning-recap').getByRole('button').first().click();
 saved=await profile(p);assert.equal(saved.completedMatches,1);assert(saved.activeMatch.recap.submitted);
 // Verify the actual IndexedDB store, not just the fallback cache.
 await expect.poll(()=>p.evaluate(()=>new Promise(resolve=>{const open=indexedDB.open('rn-learning-v1',1);open.onsuccess=()=>{const req=open.result.transaction('profiles').objectStore('profiles').get('primary');req.onsuccess=()=>resolve(req.result?.completedMatches);};}))).toBe(1);
 await p.reload();const restored=await profile(p);assert.equal(restored.playerProfileId,saved.playerProfileId);assert.equal(restored.completedMatches,1);
 checks.push('Completed solo match, optional one-item recap, actual IndexedDB persistence and refresh');
 const scientist=await page();await start(scientist,'scientist');await ask(scientist,'Does it emit positrons?');
 assert.equal(await scientist.getByTestId('prediction-cards').count(),0);assert.deepEqual(await downIds(scientist),[]);
 const syes=await answer(scientist),wrong=be.find(c=>Ge(c,query,'en').yes===syes).id;
 await card(scientist,wrong).getByRole('button',{name:'Eliminate card'}).click();assert((await downIds(scientist)).includes(wrong));assert.equal(await scientist.getByTestId('learning-panel').count(),0);
 await click(scientist,'Finished · next turn');await expect(scientist.getByTestId('learning-panel')).toContainText('remains compatible');
 await expect(scientist.getByRole('button',{name:'Finished · next turn',exact:true})).toBeDisabled();await scientist.getByTestId('learning-panel').screenshot({path:'docs/screenshots/learning-scientist-panel.png'});
 const sp=await profile(scientist);assert.equal(sp.concepts['decay.beta_plus'].mistakes,1);
 await scientist.screenshot({path:'docs/screenshots/learning-scientist-phone.png',fullPage:true});await click(scientist,'Continue');await computer(scientist);
 checks.push('Scientist permits wrong manual elimination and gives a scientific correction only after completed review');
 await ask(scientist,'Is it a metal?');await click(scientist,'Show the property on cards');assert.equal(await scientist.locator('.learning-lens').count(),59);
 assert((await profile(scientist)).activeMatch.assistedActions.length>=1);await click(scientist,'Hide the property');assert.equal(await scientist.locator('.learning-lens').count(),0);
 assert(await scientist.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await scientist.addStyleTag({content:'html{font-size:200%}'});assert(await scientist.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 checks.push('Optional chemistry lens counts as assistance; mobile and 200 percent text fit');
 // Denying both persistent stores cannot prevent ordinary play.
 const blockedContext=await browser.newContext();contexts.push(blockedContext);await blockedContext.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{get(){throw Error('blocked');}});Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});
 const blocked=await blockedContext.newPage();blocked.setDefaultTimeout(15000);blocked.on('pageerror',e=>errors.push(e.message));await blocked.goto(base);await click(blocked,'English');await start(blocked);await ask(blocked,'Does it emit positrons?');await dismiss(blocked);await click(blocked,'Finished · next turn');await computer(blocked);
 checks.push('Blocked browser persistence falls back without blocking gameplay');
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 const result={date:new Date().toISOString(),passed:checks.length,checks,pageErrors:errors,externalRequests:requests};await fs.writeFile('docs/learning-browser-results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
} catch(error){for(let i=0;i<contexts.length;i++)for(const p of contexts[i].pages()){console.log('OVERFLOW',await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,classes:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right,text:e.textContent.slice(0,70)}))));console.log('PAGE',i,(await p.locator('body').innerText()).slice(0,4500));await p.screenshot({path:`/tmp/rn-learning-failure-${i}.png`,fullPage:true});}throw error;}
finally{await browser.close();await new Promise(r=>server.close(r));}
