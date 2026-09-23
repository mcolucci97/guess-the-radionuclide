"""Evaluate base or adapter locally, retaining every prediction and error."""
import argparse,json,os,pathlib,time,collections
from llm_data import ROOT,read_rows,sha

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',type=pathlib.Path,default=ROOT/'training/llm/base');p.add_argument('--adapter',type=pathlib.Path);p.add_argument('--data',type=pathlib.Path,default=ROOT/'training/llm/heldout.jsonl');p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--device',choices=['cpu','cuda'],default='cpu');p.add_argument('--threads',type=int,default=4);a=p.parse_args()
 if a.output.exists():p.error('Report already exists. Choose a new --output to retain comparisons.')
 rows=read_rows(a.data);os.environ.update(HF_HUB_OFFLINE='1',TRANSFORMERS_OFFLINE='1',TOKENIZERS_PARALLELISM='false')
 import torch
 from transformers import AutoModelForCausalLM,AutoTokenizer
 from peft import PeftModel
 torch.set_num_threads(a.threads)
 if a.device=='cuda'and not torch.cuda.is_available():p.error('CUDA unavailable')
 dtype=torch.bfloat16 if a.device=='cuda'and torch.cuda.is_bf16_supported()else torch.float32
 model=AutoModelForCausalLM.from_pretrained(a.base,dtype=dtype,local_files_only=True)
 if a.adapter:model=PeftModel.from_pretrained(model,a.adapter,local_files_only=True)
 model.to(a.device).eval();tok=AutoTokenizer.from_pretrained(a.base,local_files_only=True);results=[]
 for r in rows:
  x=tok.apply_chat_template(r['messages'][:2],tokenize=True,add_generation_prompt=True,return_tensors='pt').to(a.device);start=time.time()
  with torch.inference_mode():y=model.generate(x,attention_mask=torch.ones_like(x),max_new_tokens=100,do_sample=False,pad_token_id=tok.pad_token_id)
  output=tok.decode(y[0,x.shape[1]:],skip_special_tokens=True)
  try:parsed=json.loads(output)
  except ValueError:parsed=None
  result={'lang':r['lang'],'text':r['text'],'expected':r['query'],'output':output,'exact':parsed==r['query'],'validJSON':parsed is not None,'seconds':time.time()-start};results.append(result);print(len(results),r['lang'],result['exact'],flush=True)
 by_language={l:{'n':sum(r['lang']==l for r in results),'correct':sum(r['lang']==l and r['exact']for r in results)}for l in ['it','en','fr']}
 report={'data':str(a.data),'dataSHA256':sha(a.data),'adapter':str(a.adapter)if a.adapter else None,'n':len(results),'correct':sum(r['exact']for r in results),'byLanguage':by_language,'results':results,'note':'Exact query match, no catalogue prompt or postprocessing. heldout.jsonl is development data, not untouched final validation.'}
 a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Saved:',a.output)
if __name__=='__main__':main()
