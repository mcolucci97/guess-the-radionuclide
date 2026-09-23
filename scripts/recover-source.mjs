import {existsSync as recoveryExists} from 'node:fs';
if(recoveryExists('src/App.js'))throw Error('Source already recovered; refusing to overwrite upgrades');
// Exact recovery from the user's published build. No replacement dataset or UI.
import fs from 'node:fs';
import {parse} from 'acorn';
import {format} from 'prettier';
const file='assets/index-DrWPOdwe.js',s=fs.readFileSync(file,'utf8');
const ast=parse(s,{ecmaVersion:'latest',sourceType:'module'});
const statements=[];let active=false;const names=[];
for(const n of ast.body){
 if(n.type==='VariableDeclaration'){
  for(const d of n.declarations){
   if(d.id.name==='de')active=true;
   if(d.id.name==='nt')active=false;
   if(active){statements.push('var '+s.slice(d.start,d.end)+';');names.push(d.id.name);}
  }
 }else if(active){statements.push(s.slice(n.start,n.end));if(n.id)names.push(n.id.name);}
}
const core=statements.join('\n')+'\nexport { '+names.join(', ')+' };\n';
fs.writeFileSync('src/engine/legacy.js',await format(core,{parser:'babel'}));
let uiStart=s.indexOf('ft=`https://doi.org/');
if(uiStart<0)throw Error('Cannot locate UI boundary');
let ui='import * as _ from "react";\nimport * as j from "react/jsx-runtime";\nimport * as v from "react-dom/client";\nimport {Atom as ie, BookOpen as ae, Earth as oe, Info as se, Play as ce, RotateCcw as le, Search as ue, Sparkles as T, X as E} from "lucide-react";\nimport { '+names.join(', ')+' } from "./engine/advanced.js";\nimport {loadLocalLLM as ut} from "./engine/llm.js";\nvar '+s.slice(uiStart);
fs.writeFileSync('src/App.js',await format(ui,{parser:'babel'}));
fs.writeFileSync('src/engine/advanced.js','export * from "./legacy.js";\n');
fs.copyFileSync('assets/index-Bp6i5BN7.css','src/style.css');
fs.copyFileSync('logos/radiolab-infn.png','public/radiolab-infn.png');
fs.writeFileSync('docs/RECOVERY.md',`# Source recovery\n\nBase: mcolucci97/guess-the-radionuclide, commit b87471e.\nThe repository contains production bundles, not the original JSX source.\nRecovered the complete application-specific JavaScript from ${file}, keeping the original database, concepts, parser, tests and UI functions. React and icon runtime code was replaced by package imports; application functions were not rewritten. Local symbol names remain those in the published build.\n`);
console.log(names.join(', '));
