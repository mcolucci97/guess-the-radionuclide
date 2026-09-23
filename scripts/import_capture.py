"""Read NGATLAS ENDF pointwise capture data, evaluate at 0.0253 eV. Not absorption."""
import json,pathlib,urllib.request,concurrent.futures,hashlib,math,bisect
R=pathlib.Path(__file__).resolve().parents[1];raw=R/'data/raw/ngatlas';raw.mkdir(exist_ok=True)
records=json.loads((R/'src/data/original-59.json').read_text())
def number(v):
 v=v.strip()
 if not v:return 0.
 try:return float(v)
 except ValueError:
  for i in range(len(v)-1,0,-1):
   if v[i] in '+-':return float(v[:i]+'e'+v[i:])
  raise

def parse(text):
 lines=text.splitlines();fields=lambda l:[number(l[i:i+11]) for i in range(0,66,11)]
 h=fields(lines[3]);nr,np=int(h[4]),int(h[5]);assert 0<nr<100 and 1<np<100000
 interp=[];offset=4
 while len(interp)<2*nr:interp+=fields(lines[offset]);offset+=1
 interp=interp[:nr*2];values=[]
 while len(values)<2*np:values+=fields(lines[offset]);offset+=1
 pts=list(zip(values[:np*2:2],values[1:np*2:2]));x=.0253
 j=bisect.bisect_right([p[0] for p in pts],x)
 if j and pts[j-1][0]==x:return pts[j-1][1],'tabulated',lines[0].strip()
 if j==0 or j>=len(pts):raise ValueError('Out of range')
 (a,ya),(b,yb)=pts[j-1:j+1];law=next(int(interp[i+1]) for i in range(0,len(interp),2) if j+1<=interp[i])
 f=(x-a)/(b-a)
 if law==1:y=ya
 elif law==2:y=ya+f*(yb-ya)
 elif law==3:y=ya+math.log(x/a)/math.log(b/a)*(yb-ya)
 elif law==4:y=math.exp(math.log(ya)+f*math.log(yb/ya))
 elif law==5:y=math.exp(math.log(ya)+math.log(x/a)/math.log(b/a)*math.log(yb/ya))
 else:raise ValueError('Unknown interpolation law')
 return y,'ENDF interpolation law '+str(law),lines[0].strip()

def fetch(r):
 id=r['id'];name=id.replace('-','')+'-102.dat';url='https://www-nds.iaea.org/ngatlas2/dat/'+name;p=raw/name
 try:
  if not p.exists():
   b=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Livechart/1.0'}),timeout=20).read()
   if b.lstrip().startswith(b'<'):raise ValueError('HTML, not ENDF')
   p.write_bytes(b)
  val,method,header=parse(p.read_text());assert val>=0 and math.isfinite(val)
  return id,{'barn':val,'energyEV':.0253,'method':method,'header':header,'sourceUrl':url,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'retrievedDate':'2026-09-18','uncertaintyBarn':None}
 except Exception as e:return id,{'barn':None,'sourceUrl':url,'status':'unavailable','reason':str(e)}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:result=dict(pool.map(fetch,records))
 (R/'docs/capture-candidate.json').write_text(json.dumps(result,indent=2)+'\n')
 print('Candidate only; scientific review required before use:',sum(v['barn'] is not None for v in result.values()),'of',len(result))
