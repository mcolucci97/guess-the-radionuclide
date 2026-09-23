import {chromium} from '@playwright/test';
import {build} from 'esbuild';
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';
await fs.access('dist/models/rn-qwen/resolve/main/ndarray-cache.json').catch(()=>{throw Error('Export the trained model and run npm run build before test:llm');});
await build({entryPoints:['src/engine/llm.js'],outfile:'dist/llm-test.js',bundle:true,format:'esm',target:'es2022',minify:true});
const root=path.resolve('dist');const server=http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'js':'application/javascript','json':'application/json','wasm':'application/wasm','html':'text/html','css':'text/css'})[file.split('.').pop()]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(4273,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-webgpu','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();const errors=[];page.on('console',m=>console.log('browser:',m.text()));page.on('pageerror',e=>errors.push(e.message));
const started=Date.now();let report;
try{
 await page.goto('http://127.0.0.1:4273/');
 const development=(await fs.readFile('training/llm/heldout.jsonl','utf8')).trim().split('\n').map(JSON.parse);
 report=await page.evaluate(async(development)=>{
  const adapter=await navigator.gpu?.requestAdapter();if(!adapter)throw Error('No WebGPU adapter');
  const {loadLocalLLM}=await import('/llm-test.js');const start=performance.now();const model=await loadLocalLLM({onProgress:s=>console.log(s)});
  const cases=development.map(r=>[r.lang,r.text,r.query]);
  const results=[];
  try{for(const[lang,text,expected]of cases){const t=performance.now();const output=await model.parse(text,lang);const row={lang,text,expected,output,seconds:(performance.now()-t)/1000,correct:expected.type==='clarify'?['clarify','invalid','unsupported'].includes(output.type):Object.keys(expected).every(k=>output[k]===expected[k]),usedTrainedLLM:output.via==='trained-webllm'};results.push(row);console.log(JSON.stringify(row));}}
  finally{await model.unload();}
  return {adapter:adapter.info?.toJSON?.()||{vendor:adapter.info?.vendor,architecture:adapter.info?.architecture},loadAndTestSeconds:(performance.now()-start)/1000,results};
 },development);
}catch(e){report={error:String(e)};process.exitCode=1;}
finally{await browser.close();await new Promise(r=>server.close(r));await fs.rm('dist/llm-test.js',{force:true});await fs.rm('dist/llm-test.js.LEGAL.txt',{force:true});}
report={date:new Date().toISOString(),purpose:'Real quantized LoRA inference in Chromium via software WebGPU; small development smoke test, not broad accuracy',elapsedSeconds:(Date.now()-started)/1000,...report,pageErrors:errors};await fs.writeFile('docs/browser-llm-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.results?.some(r=>!r.correct)||!report.results?.some(r=>r.usedTrainedLLM)||errors.length)process.exitCode=1;
