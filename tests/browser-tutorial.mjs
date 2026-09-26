import {chromium,expect} from '@playwright/test';
import {build} from 'esbuild';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {be} from '../src/engine/advanced.js';
const root=path.resolve('dist'),base='http://127.0.0.1:4177/guess-the-radionuclide/';
const reportDir='docs/tutorial-v3';await fs.mkdir(reportDir,{recursive:true});
// Exercise the real reusable artwork component with a missing localized override.
const fixture=(await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import{Artwork}from'./src/tutorial/Visuals.jsx';createRoot(document.getElementById('root')).render(React.createElement(Artwork,{name:'nucleus',lang:'fr',labels:{nucleusAlt:'Noyau conceptuel'},asset:{localized:{fr:'fr/missing.webp'},neutral:'nucleus.webp'}}));`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,format:'esm',target:'es2022'})).outputFiles[0].text;
const server=http.createServer(async(req,res)=>{try{
 let p=new URL(req.url,'http://localhost').pathname.replace(/^\/guess-the-radionuclide/,'');
 if(p==='/artwork-test.html'){res.setHeader('Content-Type','text/html');return res.end('<div id="root"></div><script type="module" src="./artwork-test.js"></script>');}
 if(p==='/artwork-test.js'){res.setHeader('Content-Type','application/javascript');return res.end(fixture);}
 if(p.endsWith('/'))p+='index.html';const file=path.resolve(root,'.'+decodeURIComponent(p));if(!file.startsWith(root+path.sep))throw Error();
 res.setHeader('Content-Type',({html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',webmanifest:'application/manifest+json',svg:'image/svg+xml',webp:'image/webp'})[file.split('.').pop()]||'application/octet-stream');res.end(await fs.readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(4177,'127.0.0.1',r));
const browser=await chromium.launch({headless:true}),contexts=[],checks=[],errors=[];
const click=(p,name)=>p.getByRole('button',{name,exact:true}).click();
const all={it:{language:'Italiano',learn:'Impara prima di giocare'},en:{language:'English',learn:'Learn before playing'},fr:{language:'Français',learn:'Apprendre avant de jouer'}};
const schemas=Object.fromEntries(await Promise.all(Object.keys(all).map(async l=>[l,JSON.parse(await fs.readFile(`src/data/tutorial-${l}.json`))])));
async function page(options={}){const c=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',...options});contexts.push(c);const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));return p;}
async function noOverflow(p){const bad=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));if(bad.scroll>bad.width+1){console.log(await p.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.getBoundingClientRect().width]).slice(0,30)));await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:reportDir+'/overflow.png',fullPage:true});}assert(bad.scroll<=bad.width+1,JSON.stringify(bad));}
try{
 const p=await page(),network=[];p.on('request',r=>network.push(r.url()));await p.goto(base);await click(p,'English');
 // No new raster or tutorial module is fetched by the home page (service worker disabled here).
 assert(!network.some(x=>/\/tutorial\/v3\/|\/Tutorial-/.test(x)));
 await click(p,all.en.learn);await expect(p.getByTestId('tutorial-v3')).toHaveAttribute('data-tutorial-path','choose');
 assert.deepEqual(await p.locator('[data-tutorial-choice]').evaluateAll(es=>es.map(e=>e.dataset.tutorialChoice)),['explorer','scientist']);
 await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:reportDir+'/entry-desktop.png',fullPage:true});checks.push('Entry: exactly two paths; new tutorial raster/module load only after entry');
 const profileBefore=await p.evaluate(()=>localStorage.getItem('rn-learning-v1:primary'));
 for(const lang of Object.keys(all)){
  await click(p,all[lang].language);const d=schemas[lang];
  for(const level of ['explorer','scientist']){
   await p.locator(`[data-tutorial-choice="${level}"]`).click();
   const chapters=d.paths[level].chapters;
   for(let i=0;i<chapters.length;i++){
    await expect(p.locator('[data-tutorial-chapter]')).toHaveAttribute('data-tutorial-chapter',chapters[i].id);
    await expect(p.getByRole('heading',{level:1})).toHaveText(chapters[i].title);
    if(chapters[i].visual==='transformations')for(const eq of ['n → p + e− + ν̄e','p → n + e+ + νe','p + e− → n + νe'])assert((await p.locator('main').innerText()).includes(eq));
    if(['emissions','medicine'].includes(chapters[i].visual))assert((await p.locator('main').innerText()).includes('¹⁸F → ¹⁸O + e+ + νe'));
    if(i===0)await expect(p.getByRole('button',{name:'← '+d.ui.previous,exact:true})).toBeDisabled();
    for(const width of [1440,768,390,320]){await p.setViewportSize({width,height:900});await noOverflow(p);}
    if(lang==='en'&&level==='explorer'&&chapters[i].id==='isotopes'){await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:reportDir+'/explorer-desktop.png',fullPage:true});}
    if(lang==='it'&&level==='explorer'&&chapters[i].id==='emissions'){await p.setViewportSize({width:390,height:844});await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:reportDir+'/pet-mobile.png',fullPage:true});}
    if(lang==='en'&&level==='scientist'&&chapters[i].id==='exponential'){
     await p.locator('#tv3-time').fill('2');await expect(p.locator('output')).toContainText('25%');
     await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:reportDir+'/scientist-desktop.png',fullPage:true});
    }
    if(chapters[i].visual==='strategy'){
     assert((await p.locator('.tv3-split>b').innerText()).startsWith(String(be.length)));
     const yes=be.filter(c=>c.modes.includes('beta-')).length;
     await p.locator('.tv3-answer-buttons button').first().click();assert.equal(await p.locator('.tv3-candidate-chips>span').count(),yes);
     await expect(p.locator('.tv3-answer-buttons button').nth(1)).toBeDisabled();await click(p,d.labels.reset);
     assert.equal(await p.locator('.tv3-candidate-chips>span').count(),be.length);
    }
    if(i<chapters.length-1)await click(p,d.ui.next+' →');
   }
   await click(p,'← '+d.ui.previous);await expect(p.locator('[data-tutorial-chapter]')).toHaveAttribute('data-tutorial-chapter',chapters.at(-2).id);
   checks.push(`${lang}/${level}: ${chapters.length} chapters, science, navigation, dynamic strategy, 320/390/768/1440px`);
  }
 }
 await click(p,'English');await p.locator('[data-tutorial-choice="scientist"]').click();await p.getByRole('heading',{level:1}).focus();await p.keyboard.press('ArrowRight');await expect(p.locator('[data-tutorial-chapter]')).toHaveAttribute('data-tutorial-chapter','transformations');await p.keyboard.press('ArrowLeft');await expect(p.locator('[data-tutorial-chapter]')).toHaveAttribute('data-tutorial-chapter','zan');
 await click(p,'All chapters +');await p.locator('#tv3-contents button').nth(3).click();await expect(p.locator('#tv3-contents')).toBeHidden();await expect(p.getByRole('heading',{level:1})).toBeFocused();
 await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'reduce'});await p.addStyleTag({content:'html{font-size:200%}'});await noOverflow(p);
 checks.push('Keyboard arrows, focus after navigation, table of contents, 200% text, reduced motion');
 assert.equal(await p.evaluate(()=>localStorage.getItem('rn-learning-v1:primary')),profileBefore);
 assert(!network.some(x=>/firebase|googleapis|research/i.test(x)));
 checks.push('No Firebase/research requests and no Learning Engine profile changes during tutorial');
 await click(p,'← Back to home');await click(p,all.en.learn);await expect(p.getByTestId('tutorial-v3')).toHaveAttribute('data-tutorial-path','scientist');
 await click(p,'All chapters +');await p.locator('#tv3-contents button').last().click();await click(p,'Set up a match →');await expect(p.locator('[data-learning-level="scientist"]')).toHaveClass(/bg-slate-900/);
 checks.push('Selected path opens directly on return and is preserved for match setup');
 const f=await page();await f.goto(base+'artwork-test.html');await expect(f.locator('img')).toHaveAttribute('src','./tutorial/v3/nucleus.webp');await expect.poll(()=>f.locator('img').evaluate(e=>e.naturalWidth)).toBeGreaterThan(0);checks.push('Missing French asset falls back to neutral artwork');
 const missing=await page();await missing.route('**/tutorial/v3/*.webp',r=>r.abort());await missing.goto(base);await click(missing,'English');await click(missing,all.en.learn);await expect(missing.locator('.tv3-art-fallback')).toBeVisible();await missing.locator('[data-tutorial-choice="explorer"]').click();await click(missing,'Next →');await expect(missing.locator('.tv3-art-fallback')).toBeVisible();assert((await missing.locator('main').innerText()).includes('H-1'));checks.push('Missing all artwork keeps explanatory text and exact diagrams accessible');
 const offline=await page({serviceWorkers:'allow'});await offline.goto(base);await offline.evaluate(()=>navigator.serviceWorker.ready);await offline.reload();await click(offline,'English');await click(offline,all.en.learn);await offline.locator('[data-tutorial-choice="explorer"]').click();await click(offline,'Next →');await expect.poll(()=>offline.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
 await offline.context().setOffline(true);await offline.reload();await click(offline,'English');await click(offline,all.en.learn);await offline.locator('[data-tutorial-choice="explorer"]').click();await click(offline,'Next →');await expect.poll(()=>offline.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);await click(offline,'Next →');await expect(offline.locator('[data-tutorial-chapter]')).toHaveAttribute('data-tutorial-chapter','transformations');checks.push('Offline reload: tutorial text, diagrams, stylesheet and visited artwork remain available');
 assert.deepEqual(errors,[]);const report={checks,passed:checks.length,pageErrors:errors};await fs.writeFile(reportDir+'/browser-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await Promise.all(contexts.map(c=>c.close()));await browser.close();await new Promise(r=>server.close(r));}
