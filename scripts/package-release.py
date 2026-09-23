import pathlib,zipfile,json,hashlib
R=pathlib.Path(__file__).resolve().parents[1];out=R.parent/'guess-the-radionuclide-v3.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=4,allowZip64=True)as z:
 for p in sorted(R.rglob('*')):
  rel=p.relative_to(R)
  if not p.is_file() or any(x in ['.git','node_modules','__pycache__']or x.startswith('.venv')for x in rel.parts):continue
  if str(rel).startswith(('training/llm/base/','training/llm/merged/','training/runs/','training/llm/wheels/')):continue
  if p.suffix=='.log' or p.name.startswith('llm-test.'):continue
  z.write(p,'guess-the-radionuclide/'+str(rel))
print(json.dumps({'file':str(out),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
