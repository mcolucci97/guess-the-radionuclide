"""Local dataset checks shared by training and evaluation; no network access."""
import json,hashlib,pathlib,math,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1]
def sha(path):return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()
def key(row):return unicodedata.normalize('NFKC',row['text']).casefold().strip()
def read_rows(path):
 catalogue=json.loads((ROOT/'training/llm/catalogue.json').read_text(encoding='utf8'));rows=[];seen={}
 for line_number,line in enumerate(pathlib.Path(path).read_text(encoding='utf8').splitlines(),1):
  if not line.strip():continue
  r=json.loads(line);q=r['query'];m=r['messages']
  if r['lang']not in ['it','en','fr']or not 0<len(r['text'])<=400:raise ValueError(f'{path}:{line_number}: language/text')
  if [x['role']for x in m]!=['system','user','assistant']or m[1]['content']!=r['text']or json.loads(m[2]['content'])!=q:raise ValueError(f'{path}:{line_number}: messages/label mismatch')
  if q.get('type')=='clarify':
   if q!={'type':'clarify'}:raise ValueError('Clarify must have only type')
  elif q.get('type')=='parsed'and isinstance(q.get('negated'),bool):
   if q.get('queryType')=='concept':
    if q.get('conceptId')not in catalogue:raise ValueError(f'Unknown concept: {q}')
   elif q.get('queryType')=='numeric':
    if q.get('property')not in ['Z','A','N','halfLifeSeconds','meanLifeSeconds','meltingPointC','thermalNeutronCaptureBarn','principalGammaKeV']or q.get('operator')not in ['<','>','<=','>=','==']or type(q.get('value'))not in [int,float]or not math.isfinite(q['value']):raise ValueError(f'Invalid number: {q}')
    if q['property']!='meltingPointC'and q['value']<0:raise ValueError('Negative threshold unsupported by the game schema')
   else:raise ValueError('This SFT kit supports concept/numeric/clarify labels')
  else:raise ValueError(f'Invalid query: {q}')
  k=(r['lang'],key(r))
  if k in seen and seen[k]!=q:raise ValueError(f'Conflicting labels: {r["text"]}')
  seen[k]=q;rows.append(r)
 if not rows:raise ValueError(f'Empty dataset: {path}')
 return rows

def read_pair(train,dev):
 a,b=read_rows(train),read_rows(dev);overlap={key(r)for r in a}&{key(r)for r in b}
 if overlap:raise ValueError(f'Train/evaluation overlap: {sorted(overlap)[:5]}')
 return a,b
