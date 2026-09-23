"""Merge a selected adapter locally; never overwrite a previous merge."""
import argparse,pathlib,shutil,os,json
R=pathlib.Path(__file__).resolve().parents[1];D=R/'training/llm'
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',type=pathlib.Path,default=D/'base');p.add_argument('--adapter',type=pathlib.Path,default=D/'adapter');p.add_argument('--output',type=pathlib.Path,default=D/'merged');a=p.parse_args()
if a.output.exists()and any(a.output.iterdir()):p.error('Output not empty. Select a new --output.')
os.environ.update(HF_HUB_OFFLINE='1',TRANSFORMERS_OFFLINE='1')
import torch
from transformers import AutoModelForCausalLM,AutoTokenizer
from peft import PeftModel
torch.set_num_threads(4)
m=AutoModelForCausalLM.from_pretrained(a.base,dtype=torch.float32,local_files_only=True);m=PeftModel.from_pretrained(m,a.adapter,local_files_only=True).merge_and_unload(safe_merge=True);m.save_pretrained(a.output,safe_serialization=True);AutoTokenizer.from_pretrained(a.base,local_files_only=True).save_pretrained(a.output);shutil.copyfile(D/'LICENSE-Qwen.txt',a.output/'LICENSE')
(a.output/'rn-export.json').write_text(json.dumps({'adapter':str(a.adapter),'base':str(a.base),'format':'merged float32'},indent=2))
print('Merged weights:',a.output)
