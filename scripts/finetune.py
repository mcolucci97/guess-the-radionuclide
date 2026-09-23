import os,json,pathlib,random,time,hashlib
os.environ['TOKENIZERS_PARALLELISM']='false'
import torch
from transformers import AutoModelForCausalLM,AutoTokenizer
from peft import LoraConfig,get_peft_model
R=pathlib.Path(__file__).resolve().parents[1];D=R/'training/llm';torch.set_num_threads(8);torch.manual_seed(20260919);random.seed(20260919)
read=lambda name:[json.loads(l)for l in(D/name).read_text().splitlines()]
tok=AutoTokenizer.from_pretrained(D/'base',local_files_only=True);tok.padding_side='right';model=AutoModelForCausalLM.from_pretrained(D/'base',dtype=torch.bfloat16,attn_implementation='sdpa',local_files_only=True)
def evaluate(name):
 model.eval();rows=[]
 for r in read('heldout.jsonl'):
  x=tok.apply_chat_template(r['messages'][:2],tokenize=True,add_generation_prompt=True,return_tensors='pt');mask=torch.ones_like(x)
  with torch.inference_mode():y=model.generate(x,attention_mask=mask,max_new_tokens=100,do_sample=False,pad_token_id=tok.pad_token_id)
  s=tok.decode(y[0,len(x[0]):],skip_special_tokens=True)
  try:q=json.loads(s)
  except ValueError:q=None
  rows.append({'lang':r['lang'],'text':r['text'],'expected':r['query'],'output':s,'exact':q==r['query']});print(name,len(rows),rows[-1]['exact'],flush=True)
 (D/name).write_text(json.dumps({'n':len(rows),'correct':sum(r['exact']for r in rows),'results':rows},ensure_ascii=False,indent=2))
evaluate('evaluation-base.json')
model=get_peft_model(model,LoraConfig(r=8,lora_alpha=16,lora_dropout=.05,target_modules=['q_proj','v_proj'],task_type='CAUSAL_LM'));model.config.use_cache=False;model.train();train=read('train.jsonl');data=[]
for r in train:
 prefix=tok.apply_chat_template(r['messages'][:2],tokenize=True,add_generation_prompt=True);full=tok.apply_chat_template(r['messages'],tokenize=True)
 assert full[:len(prefix)]==prefix and len(full)<384
 data.append((full,[-100]*len(prefix)+full[len(prefix):]))
random.shuffle(data);opt=torch.optim.AdamW([p for p in model.parameters()if p.requires_grad],lr=3e-4,weight_decay=.01);log=[];start=time.time();batchsize=4
for offset in range(0,len(data),batchsize):
 batch=data[offset:offset+batchsize];n=max(len(x)for x,y in batch);x=torch.tensor([x+[tok.pad_token_id]*(n-len(x))for x,y in batch]);y=torch.tensor([y+[-100]*(n-len(y))for x,y in batch]);opt.zero_grad(set_to_none=True);loss=model(input_ids=x,attention_mask=x.ne(tok.pad_token_id),labels=y).loss
 assert torch.isfinite(loss)
 loss.backward();torch.nn.utils.clip_grad_norm_(model.parameters(),1);opt.step();step=offset//batchsize+1;log.append({'step':step,'loss':round(loss.item(),6),'seconds':round(time.time()-start,2)})
 if step%10==0 or step==1:print(json.dumps(log[-1]),flush=True)
 if step%50==0:model.save_pretrained(D/'adapter');(D/'train-log.json').write_text(json.dumps(log,indent=2))
model.save_pretrained(D/'adapter');tok.save_pretrained(D/'adapter');model.config.use_cache=True;(D/'train-log.json').write_text(json.dumps(log,indent=2));(D/'training-run.json').write_text(json.dumps({'epochs':1,'steps':step,'examples':len(train),'batchSize':batchsize,'seed':20260919,'loraRank':8,'learningRate':.0003,'trainableParameters':sum(p.numel()for p in model.parameters()if p.requires_grad),'seconds':time.time()-start,'datasetSHA256':hashlib.sha256((D/'train.jsonl').read_bytes()).hexdigest()},indent=2));evaluate('evaluation-adapter.json')
