"""Export merged Qwen2 weights as MLC q4f32_1 using NumPy.
Algorithm: https://github.com/mlc-ai/mlc-llm/blob/main/python/mlc_llm/quantization/group_quantization.py
32 values/group; symmetric [-7,7], uint32 packing, float32 scales.
Validate every parameter against the official model's tensor manifest, and every
quantized value against its group's half-step error bound. Browser inference is
separately tested; successful export alone is not inference validation.
"""
import json,pathlib,hashlib,shutil,argparse
import numpy as np
from safetensors import safe_open
R=pathlib.Path(__file__).resolve().parents[1];D=R/'training/llm'
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--merged',type=pathlib.Path,default=D/'merged');p.add_argument('--replace',action='store_true');args=p.parse_args()
OUT=R/'models/rn-qwen'
if (OUT/'ndarray-cache.json').exists()and not args.replace:p.error('Model export already exists; use --replace only to deliberately update it.')
if not list(args.merged.glob('*.safetensors')):p.error('Merged safetensors are missing. Run export-llm.py first.')
OUT.mkdir(parents=True,exist_ok=True)
reference=json.loads((D/'web-reference/ndarray-cache.json').read_text());handles=[safe_open(p,framework='numpy')for p in args.merged.glob('*.safetensors')];lookup={k:h for h in handles for k in h.keys()}
def tensor(name):
 if '.c_attn.' in name:return np.concatenate([tensor(name.replace('.c_attn.',f'.{part}_proj.'))for part in ['q','k','v']],axis=0)
 if '.gate_up_proj.' in name:return np.concatenate([tensor(name.replace('.gate_up_proj.',f'.{part}_proj.'))for part in ['gate','up']],axis=0)
 return lookup[name].get_tensor(name).astype(np.float32)
def quantize(w):
 n,k=w.shape;assert k%32==0
 packed=np.empty((n,k//8),np.uint32);scales=np.empty((n,k//32),np.float32)
 for start in range(0,n,2048):
  a=w[start:start+2048].reshape(-1,k//32,32);scale=np.max(np.abs(a),axis=-1)/np.float32(7)
  ratio=np.divide(a,scale[...,None],out=np.zeros_like(a),where=scale[...,None]!=0)
  q=np.clip(np.floor(ratio+np.float32(7.5)),0,14).astype(np.uint32)
  reconstructed=(q.astype(np.float32)-7)*scale[...,None]
  assert np.all(np.abs(reconstructed-a)<=scale[...,None]*np.float32(.501)+1e-6)
  packed[start:start+len(a)]=np.bitwise_or.reduce(q.reshape(len(a),k//8,8)<<np.arange(0,32,4,dtype=np.uint32),axis=-1)
  scales[start:start+len(a)]=scale
 return packed,scales
records=[];blob=bytearray();entries=[];pairs={};count=0
for p in OUT.glob('params_shard_*.bin'):p.unlink()
def flush():
 global blob,entries
 if not entries:return
 name=f'params_shard_{len(records)}.bin';(OUT/name).write_bytes(blob);records.append(dict(dataPath=name,format='raw-shard',nbytes=len(blob),records=entries));print(name,len(blob),flush=True);blob=bytearray();entries=[]
for shard in reference['records']:
 for spec in shard['records']:
  name=spec['name']
  if name.endswith(('.q_weight','.q_scale')):
   base,suffix=name.rsplit('.',1)
   if base not in pairs:pairs[base]=quantize(tensor(base+'.weight'))
   value=pairs[base][0 if suffix=='q_weight'else 1]
   if suffix=='q_scale':del pairs[base]
  else:value=tensor(name)
  assert list(value.shape)==spec['shape'],(name,value.shape,spec['shape'])
  assert str(value.dtype)==spec['dtype'],(name,value.dtype,spec['dtype'])
  raw=value.astype(value.dtype.newbyteorder('<'),copy=False).tobytes()
  if len(blob)+len(raw)>80*1024**2:flush()
  entries.append(dict(name=name,shape=list(value.shape),dtype=str(value.dtype),format='raw',nbytes=len(raw),byteOffset=len(blob)));blob.extend(raw);count+=1
flush();assert count==reference['metadata']['ParamSize']
(OUT/'ndarray-cache.json').write_text(json.dumps(dict(metadata=reference['metadata'],records=records),indent=2))
cfg=json.loads((D/'web-reference/mlc-chat-config.json').read_text());cfg.update(context_window_size=4096,prefill_chunk_size=1024,temperature=0,repetition_penalty=1,top_p=1);cfg['model_config'].update(context_window_size=4096,prefill_chunk_size=1024,max_batch_size=1)
(OUT/'mlc-chat-config.json').write_text(json.dumps(cfg,indent=2))
for name in cfg['tokenizer_files']:shutil.copyfile(D/'base'/name,OUT/name)
shutil.copyfile(D/'LICENSE-Qwen.txt',OUT/'LICENSE');(OUT/'NOTICE').write_text('RN-Qwen: derivative of Qwen2.5-0.5B-Instruct, Apache-2.0. LoRA training: training/llm/. MLC WebGPU binary and runtime: Apache-2.0. No IAEA endorsement.\n')
files=[dict(file=p.name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())for p in sorted(OUT.iterdir())if p.is_file()]
(D/'browser-export.json').write_text(json.dumps(dict(quantization='q4f32_1',parameters=count,totalBytes=sum(x['bytes']for x in files),validation='All shapes/dtypes and elementwise quantization bounds checked; browser test is separate',files=files),indent=2));print('Exported',count,'tensors',sum(x['bytes']for x in files),'bytes')
