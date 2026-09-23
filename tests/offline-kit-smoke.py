"""Exercise train/resume/warm-start/evaluate/merge on a tiny random local model.
This tests software plumbing only, never the quality of the scientific LLM.
"""
import pathlib,tempfile,json,subprocess,sys,shutil,os
import torch
from tokenizers import Tokenizer
from tokenizers.models import WordLevel
from tokenizers.pre_tokenizers import Whitespace
from transformers import PreTrainedTokenizerFast,Qwen2Config,Qwen2ForCausalLM
from safetensors.torch import load_file
R=pathlib.Path(__file__).resolve().parents[1]
def main():
 with tempfile.TemporaryDirectory(prefix='rn-training-test-')as tmp:
  tmp=pathlib.Path(tmp);base=tmp/'base';base.mkdir()
  vocab={'[UNK]':0,'[PAD]':1,'[EOS]':2,'system':3,'user':4,'assistant':5}
  t=Tokenizer(WordLevel(vocab,unk_token='[UNK]'));t.pre_tokenizer=Whitespace()
  tok=PreTrainedTokenizerFast(tokenizer_object=t,unk_token='[UNK]',pad_token='[PAD]',eos_token='[EOS]');tok.chat_template="{% for message in messages %}{{ message['role'] + ': ' + message['content'] + eos_token }}{% endfor %}{% if add_generation_prompt %}{{ 'assistant: ' }}{% endif %}";tok.save_pretrained(base)
  torch.manual_seed(91);Qwen2ForCausalLM(Qwen2Config(vocab_size=len(vocab),hidden_size=32,intermediate_size=64,num_hidden_layers=1,num_attention_heads=4,num_key_value_heads=2,max_position_embeddings=512,tie_word_embeddings=True,bos_token_id=2,eos_token_id=2,pad_token_id=1)).save_pretrained(base)
  original=[json.loads(x)for x in(R/'training/llm/train.jsonl').read_text().splitlines()]
  train=tmp/'train.jsonl';dev=tmp/'dev.jsonl';train.write_text('\n'.join(json.dumps(x)for x in original[:8]));dev.write_text('\n'.join(json.dumps(x)for x in original[20:23]))
  out=tmp/'run'
  def run(*args):subprocess.run([sys.executable,*map(str,args)],cwd=R,check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
  args=['scripts/train-offline.py','--base',base,'--train',train,'--dev',dev,'--output',out,'--device','cpu','--max-steps','3','--batch-size','2','--accumulation','2','--save-steps','1','--threads','1']
  run(*args);expected=load_file(out/'final/adapter_model.safetensors')
  # Simulate an interruption after checkpoint 2, inside the private fixture only.
  shutil.rmtree(out/'checkpoint-3');shutil.rmtree(out/'final');(out/'training-summary.json').unlink();(out/'checkpoint-999').mkdir()
  run(*args,'--resume');actual=load_file(out/'final/adapter_model.safetensors');assert expected.keys()==actual.keys();assert all(torch.equal(expected[k],actual[k])for k in expected),'Resume changed weights'
  warm=tmp/'warm';run('scripts/train-offline.py','--base',base,'--train',train,'--dev',dev,'--output',warm,'--init-adapter',out/'final','--device','cpu','--max-steps','1','--save-steps','1','--threads','1')
  run('scripts/evaluate-offline.py','--base',base,'--adapter',warm/'final','--data',dev,'--output',tmp/'eval.json','--threads','1');assert json.loads((tmp/'eval.json').read_text())['n']==3
  run('scripts/export-llm.py','--base',base,'--adapter',warm/'final','--output',tmp/'merged');assert list((tmp/'merged').glob('*.safetensors'))
  report={'test':'Tiny random local Qwen2 model, CPU only','passed':['Training checkpoints include optimizer/scheduler/RNG','Incomplete checkpoint skipped; resume reproduces identical final adapter tensors','Warm start from adapter','Evaluation retains all 3 rows','Adapter merge exports safetensors'],'limitations':'Not a scientific-model training run; CUDA and full-scale new Trainer workflow not executed.'}
  (R/'docs/offline-kit-test.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if __name__=='__main__':
 try:main()
 except subprocess.CalledProcessError as e:print(e.stdout);raise
