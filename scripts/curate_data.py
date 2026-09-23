"""Build a traceable nuclear overlay. Educational stories remain the original author's."""
import csv,json,pathlib,math,hashlib
R=pathlib.Path(__file__).resolve().parents[1];raw=R/'data/raw'
def rows(name):return list(csv.DictReader((raw/name).open()))
def num(v):
 try:return float(v)
 except (ValueError,TypeError):return None
base=json.loads((R/'src/data/original-59.json').read_text());ground=rows('ground_states.csv');out={};changes=[]
for r in base:
 id=r['id'];iso=id.endswith('m');q=id.split('-')[1].replace('m','')+r['symbol'].lower()
 if iso:d=next(x for x in rows('99tc_levels.csv') if x['energy']=='142.6836')
 else:d=next(x for x in ground if x['symbol']==r['symbol'] and int(x['z'])+int(x['n'])==r['A'])
 branches=[{'mode':d['decay_'+str(i)],'percent':num(d['decay_'+str(i)+'_%']),'uncertainty':d.get('unc_'+str(i))} for i in range(1,4) if d.get('decay_'+str(i))]
 g=rows(q+'_g.csv');g=[x for x in g if num(x.get('p_energy'))==(142.6836 if iso else 0)]
 # The service appends calculated X rays to some gamma responses. Require a nuclear start level.
 gammas=[{'keV':num(x['energy']),'intensityPercent':num(x['intensity']),'uncertaintyKeV':num(x.get('unc_en')),'daughter':x.get('d_symbol','')+'-'+str(int(x.get('d_z','0'))+int(x.get('d_n','0')))} for x in g if x.get('start_level_energy','').strip() and num(x.get('energy')) is not None and num(x.get('intensity')) is not None]
 major=sorted([x for x in gammas if x['intensityPercent']>=1],key=lambda x:-x['intensityPercent'])
 bpfile=raw/(q+'_bp.csv');br=rows(q+'_bp.csv')if bpfile.exists()else[];br=[x for x in br if num(x.get('p_energy'))==(142.6836 if iso else 0)]
 split={'available':bool(br),'positronIntensitySum':sum(num(x.get('intensity_beta'))or 0 for x in br),'electronCaptureIntensitySum':sum(num(x.get('intensity_ec'))or 0 for x in br),'positronObserved':any((num(x.get('intensity_beta'))or 0)>0 for x in br),'electronCaptureObserved':any((num(x.get('intensity_ec'))or 0)>0 for x in br),'sourceUrl':'https://www-nds.iaea.org/relnsd/v1/data?fields=decay_rads&nuclides='+q+'&rad_types=bp'}
 half=num(d['half_life_sec']);assert half and half>0
 o={'halfLifeSeconds':half,'halfLifeDisplay':d['half_life']+' '+d['unit_hl'],'halfLifeUncertaintySeconds':num(d.get('unc_hls')),'halfLifeUncertaintyENSDF':d.get('unc_hl'),'branches':branches,'ecBetaEvidence':split,'gammaLines':major,'gammaDatasetAvailable':bool(g),'gammaThresholdPercent':1,'gammaSourceUrl':'https://www-nds.iaea.org/relnsd/v1/data?fields=decay_rads&nuclides='+q+'&rad_types=g','evaluationCutoff':d.get('ENSDFpublicationcut-off') or d.get('ENSDF_publication_cut-off'),'evaluators':d.get('ENSDFauthors') or d.get('ENSDF_authors'),'sourceExtractionDate':d['Extraction_date'],'sourceUrl':'https://www-nds.iaea.org/relnsd/v1/data?fields='+('levels' if iso else 'ground_states')+'&nuclides='+q,'retrievedDate':'2026-09-18','isomer':iso,'energyKeV':num(d['energy'])}
 out[id]=o
 if abs(float(r['seconds'])-half)/half>1e-4:changes.append({'id':id,'oldSeconds':r['seconds'],'evaluatedSeconds':half,'relativeChange':(half-float(r['seconds']))/half})
(R/'src/data/nuclear-overlay.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(R/'docs/half-life-audit.json').write_text(json.dumps(changes,indent=2)+'\n');print(len(out),'nuclides;',len(changes),'half-life differences')
