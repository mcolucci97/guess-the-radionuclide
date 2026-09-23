import pathlib,json
from huggingface_hub import snapshot_download
R=pathlib.Path(__file__).resolve().parents[1];p=R/'training/llm';p.mkdir(exist_ok=True)
m={'repository':'Qwen/Qwen2.5-0.5B-Instruct','revision':'7ae557604adf67be50417f59c2c2f167def9a775','license':'apache-2.0','license_url':'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE'}
(p/'base-model.json').write_text(json.dumps(m,indent=2))
snapshot_download(m['repository'],revision=m['revision'],local_dir=p/'base',allow_patterns=['*.json','*.safetensors','*.txt','LICENSE','README.md'])
(p/'LICENSE-Qwen.txt').write_bytes((p/'base/LICENSE').read_bytes())
