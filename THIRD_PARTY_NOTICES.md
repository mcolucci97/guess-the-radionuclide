# Attribution and licences

Digital game: **Michele Colucci**. Original educational game: **RadioLAB / INFN**, [DOI 10.15161/oar.it/77027](https://doi.org/10.15161/oar.it/77027). The existing combined logo and original attribution are retained. The upstream repository did not include a project-wide software licence; this revision does not relicense the original material or claim ownership of it.

Model: **Qwen2.5-0.5B-Instruct**, Alibaba Cloud, Apache License 2.0. Full licence: `training/llm/LICENSE-Qwen.txt`. The pinned base revision and changes (supervised LoRA fine-tuning) are documented under `training/llm/`. Any redistributed merged or quantized weights are derivatives, not the unchanged upstream model.

React / React DOM: MIT. Lucide: ISC. WebLLM / MLC: Apache-2.0. Dependency versions are pinned in `package-lock.json`; licence texts are collected in `docs/dependency-licenses/`. The WebGPU model library is from the official MLC binary library repository, version `v0_2_48`.

Scientific extracts: IAEA Nuclear Data Services / LiveChart and underlying ENSDF evaluators, with URLs, retrieval dates and hashes. Public access is not presented as a blanket unrestricted licence over all IAEA content. These scientific extracts were not used as an unlicensed scraped question-answer training corpus.

Training questions derive from the author's existing game catalogue and newly authored synthetic examples. No private messages, scraped commercial question banks, paywalled corpora or user telemetry were used. The test set is small and cannot establish exhaustive language coverage.

No endorsement or certification by IAEA, INFN, Qwen or MLC is claimed.
