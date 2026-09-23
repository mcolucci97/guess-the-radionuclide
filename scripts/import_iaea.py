"""Download auditable IAEA CSV snapshots. Network required only for refreshing."""
import csv,json,urllib.request,hashlib,datetime,pathlib,concurrent.futures,time
ROOT=pathlib.Path(__file__).resolve().parents[1]; RAW=ROOT/'data/raw'; RAW.mkdir(parents=True,exist_ok=True)
EXISTING={x['file']:x for x in json.loads((RAW/'manifest.json').read_text())} if (RAW/'manifest.json').exists() else {}
IDS=[r['id'] for r in json.loads((ROOT/'src/data/original-59.json').read_text())]
BASE='https://www-nds.iaea.org/relnsd/v1/data?'

def fetch(key,params):
 p=RAW/(key+'.csv'); url=BASE+params
 if not p.exists():
  for attempt in range(3):
   try:
    data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Livechart/1.0'}),timeout=40).read()
    if b',' not in data[:500] and data.strip() not in [b'0',b'1']: raise ValueError(f'Invalid CSV response {data[:100]}')
    p.write_bytes(data); break
   except Exception:
    if attempt==2: raise
    time.sleep(1)
 key=str(p.relative_to(ROOT))
 if key in EXISTING and EXISTING[key]['sha256']==hashlib.sha256(p.read_bytes()).hexdigest():return EXISTING[key]
 return {'file':key,'url':url,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'retrieved_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}

def main():
 jobs=[('ground_states','fields=ground_states&nuclides=all'),('99tc_levels','fields=levels&nuclides=99tc')]
 for id in IDS:
  el,a=id.split('-'); nu=a.replace('m','')+el.lower()
  jobs.append((nu+'_g',f'fields=decay_rads&nuclides={nu}&rad_types=g'))
 # EC+B+ is a combined branch; positive beta intensities establish a beta+ branch.
 for id in ['Tb-149','K-40','Cu-64','Tb-152','I-124','F-18','N-13','O-15','C-11','Na-22','Ga-68','Zr-89','I-123','Al-26','Cl-36']:
  el,a=id.split('-'); nu=a+el.lower(); jobs.append((nu+'_bp',f'fields=decay_rads&nuclides={nu}&rad_types=bp'))
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  results=list(pool.map(lambda j:fetch(*j),jobs))
 (RAW/'manifest.json').write_text(json.dumps(results,indent=2)+'\n')
 print(f'{len(results)} source snapshots for {len(IDS)} nuclides')
if __name__=='__main__':main()
