# Stato della LLM

La consegna include il kit descritto in [ALLENAMENTO_OFFLINE_IT.md](ALLENAMENTO_OFFLINE_IT.md), il corpus trilingue, il catalogo e i pesi LoRA già addestrati. Il modello base completo e i pesi browser quantizzati non sono inclusi: si preparano con gli script indicati nella guida.

Addestramento realmente concluso: Qwen2.5-0.5B-Instruct, 1.316 esempi, una epoca, 329 aggiornamenti, 540.672 parametri LoRA, circa 547 secondi di training CPU. Rapporti e output sono in `training/llm/`.

Valutazione grezza su 33 casi: base **0/33**, LoRA **6/33**. Il risultato è insufficiente per presentare la LLM come pronta all'uso autonomo. I casi sono ormai un insieme di sviluppo: sono stati esaminati durante le correzioni. Non dimostrano copertura di tutte le domande possibili.

Il gioco conserva il proprio interprete offline e non dipende dalla LLM. La funzione generativa è facoltativa e sperimentale; il pulsante resta disabilitato quando i file del modello non sono installati. La carta segreta non entra nel prompt e le risposte scientifiche restano calcolate dal database dopo la conferma dell'interpretazione.

La nuova pipeline locale aggiunge checkpoint con ottimizzatore, scheduler e stato casuale. Il vecchio `finetune.py` resta come codice dell'esecuzione storica; per nuovi esperimenti usare `train-offline.py` e una nuova cartella di output.
