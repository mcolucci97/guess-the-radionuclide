"""Resumable local LoRA training. Run --help without loading ML dependencies."""
import argparse,json,os,pathlib,sys
from llm_data import ROOT,read_pair,sha

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--base',type=pathlib.Path,default=ROOT/'training/llm/base')
 p.add_argument('--train',type=pathlib.Path,default=ROOT/'training/llm/train.jsonl')
 p.add_argument('--dev',type=pathlib.Path,default=ROOT/'training/llm/heldout.jsonl')
 p.add_argument('--output',type=pathlib.Path,default=ROOT/'training/runs/run-001')
 p.add_argument('--init-adapter',type=pathlib.Path,help='Warm start: weights only, new optimizer')
 p.add_argument('--resume',action='store_true',help='Resume last complete Trainer checkpoint in --output')
 p.add_argument('--device',choices=['auto','cpu','cuda'],default='auto')
 p.add_argument('--epochs',type=float,default=3);p.add_argument('--batch-size',type=int,default=1)
 p.add_argument('--accumulation',type=int,default=8);p.add_argument('--lr',type=float,default=1e-4)
 p.add_argument('--rank',type=int,default=8);p.add_argument('--max-length',type=int,default=512)
 p.add_argument('--save-steps',type=int,default=50);p.add_argument('--threads',type=int,default=4)
 p.add_argument('--seed',type=int,default=20260920);p.add_argument('--max-steps',type=int,default=-1,help='Short smoke run; -1 uses epochs')
 p.add_argument('--gradient-checkpointing',action='store_true')
 args=p.parse_args()
 if min(args.epochs,args.batch_size,args.accumulation,args.lr,args.rank,args.max_length,args.save_steps,args.threads)<=0:p.error('Positive hyperparameters required')
 if args.max_steps==0 or args.max_steps< -1:p.error('--max-steps must be positive or -1')
 train,dev=read_pair(args.train,args.dev)
 os.environ.update(HF_HUB_OFFLINE='1',TRANSFORMERS_OFFLINE='1',HF_DATASETS_OFFLINE='1',TOKENIZERS_PARALLELISM='false')
 import torch
 from transformers import AutoTokenizer,AutoModelForCausalLM,Trainer,TrainingArguments,set_seed
 from peft import get_peft_model,LoraConfig,PeftModel
 torch.set_num_threads(args.threads);set_seed(args.seed)
 device=('cuda'if torch.cuda.is_available()else'cpu')if args.device=='auto'else args.device
 if device=='cuda'and not torch.cuda.is_available():p.error('CUDA unavailable: install compatible PyTorch/driver or use --device cpu')
 bf16=device=='cuda'and torch.cuda.is_bf16_supported()
 manifest={k:str(v.resolve())if isinstance(v,pathlib.Path)else v for k,v in vars(args).items()if k!='resume'}
 manifest.update(trainSHA256=sha(args.train),devSHA256=sha(args.dev),baseConfigSHA256=sha(args.base/'config.json'),resolvedDevice=device,bfloat16=bf16)
 manifest_path=args.output/'run-config.json';checkpoint=None
 if args.resume:
  if not manifest_path.exists():p.error('No run-config.json to resume')
  previous=json.loads(manifest_path.read_text())
  if previous!=manifest:p.error('Resume requires identical data, paths and options. Use --init-adapter in a new output for a changed experiment.')
  required=['optimizer.pt','scheduler.pt','trainer_state.json','rng_state.pth','adapter_model.safetensors','adapter_config.json']
  candidates=sorted((x for x in args.output.glob('checkpoint-*')if x.is_dir()and x.name.split('-')[-1].isdigit()),key=lambda x:int(x.name.split('-')[-1]),reverse=True)
  checkpoint=next((str(x)for x in candidates if all((x/name).is_file()for name in required)),None)
  if not checkpoint:p.error('No complete Trainer checkpoint found')
 elif args.output.exists()and any(args.output.iterdir()):p.error('Output is not empty. Choose a new --output or use --resume.')
 args.output.mkdir(parents=True,exist_ok=True)
 manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
 tokenizer=AutoTokenizer.from_pretrained(args.base,local_files_only=True);tokenizer.padding_side='right'
 if tokenizer.pad_token_id is None:tokenizer.pad_token=tokenizer.eos_token
 model=AutoModelForCausalLM.from_pretrained(args.base,local_files_only=True,dtype=torch.bfloat16 if bf16 else torch.float32,attn_implementation='sdpa')
 init=pathlib.Path(checkpoint)if checkpoint else args.init_adapter
 if init:model=PeftModel.from_pretrained(model,init,is_trainable=True,local_files_only=True)
 else:model=get_peft_model(model,LoraConfig(r=args.rank,lora_alpha=2*args.rank,lora_dropout=.05,target_modules=['q_proj','v_proj'],task_type='CAUSAL_LM'))
 model.config.use_cache=False
 def encode(rows):
  result=[]
  for r in rows:
   prefix=tokenizer.apply_chat_template(r['messages'][:2],tokenize=True,add_generation_prompt=True)
   full=tokenizer.apply_chat_template(r['messages'],tokenize=True)
   if full[:len(prefix)]!=prefix:raise ValueError('Chat template prefix mismatch')
   if len(full)>args.max_length:raise ValueError(f'No silent truncation: {len(full)} tokens for {r["text"]}')
   result.append({'input_ids':full,'labels':[-100]*len(prefix)+full[len(prefix):]})
  return result
 def collate(batch):
  n=max(len(r['input_ids'])for r in batch)
  return {'input_ids':torch.tensor([r['input_ids']+[tokenizer.pad_token_id]*(n-len(r['input_ids']))for r in batch]),'attention_mask':torch.tensor([[1]*len(r['input_ids'])+[0]*(n-len(r['input_ids']))for r in batch]),'labels':torch.tensor([r['labels']+[-100]*(n-len(r['labels']))for r in batch])}
 config=TrainingArguments(output_dir=str(args.output),num_train_epochs=args.epochs,max_steps=args.max_steps,per_device_train_batch_size=args.batch_size,per_device_eval_batch_size=1,gradient_accumulation_steps=args.accumulation,learning_rate=args.lr,weight_decay=.01,lr_scheduler_type='constant',save_strategy='steps',save_steps=args.save_steps,save_total_limit=2,eval_strategy='steps',eval_steps=args.save_steps,logging_steps=10,report_to='none',use_cpu=device=='cpu',bf16=bf16,fp16=False,dataloader_num_workers=0,seed=args.seed,data_seed=args.seed,optim='adamw_torch',gradient_checkpointing=args.gradient_checkpointing,gradient_checkpointing_kwargs={'use_reentrant':False},save_safetensors=True)
 trainer=Trainer(model=model,args=config,train_dataset=encode(train),eval_dataset=encode(dev),data_collator=collate,processing_class=tokenizer)
 result=trainer.train(resume_from_checkpoint=checkpoint)
 final=args.output/'final';trainer.save_model(str(final));tokenizer.save_pretrained(final)
 # Use a portable public base reference in exported adapter metadata.
 c=final/'adapter_config.json';d=json.loads(c.read_text());d['base_model_name_or_path']='Qwen/Qwen2.5-0.5B-Instruct';d['revision']='7ae557604adf67be50417f59c2c2f167def9a775';c.write_text(json.dumps(d,indent=2)+'\n')
 (args.output/'training-summary.json').write_text(json.dumps({'status':'completed','globalStep':trainer.state.global_step,'trainRows':len(train),'devRows':len(dev),'trainableParameters':sum(x.numel()for x in model.parameters()if x.requires_grad),'metrics':result.metrics,'warmStart':str(args.init_adapter)if args.init_adapter else None,'resumedFrom':checkpoint},indent=2)+'\n')
 print('Saved adapter:',final)
if __name__=='__main__':main()
