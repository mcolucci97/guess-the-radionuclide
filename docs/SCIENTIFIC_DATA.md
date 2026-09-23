# Dati scientifici

Il mazzo contiene le 59 carte originali. `src/data/original-59.json` conserva il recupero originale; `src/data/nuclear-overlay.json` contiene la revisione nucleare tracciabile. Storie, chimica e associazioni applicative non sono state rivalidate integralmente.

`data/raw/manifest.json` contiene URL, SHA-256 e data di acquisizione. `scripts/import_iaea.py` conserva i file già scaricati; per aggiornare, archivia prima gli estratti interessati e poi rimuovili esplicitamente. Ricostruisci con `python3 scripts/curate_data.py` e verifica il diff prima della pubblicazione.

Il file `ground_states.csv` riporta una data di estrazione del 2023, pur essendo stato acquisito nel settembre 2026. Le date di valutazione ENSDF possono essere ancora precedenti. **Scaricato oggi non significa valutato oggi.** I 44 scostamenti in `docs/half-life-audit.json` comprendono arrotondamenti e diverse conversioni anno/secondo: non sono 44 errori dimostrati nella versione precedente.

- Un anno nel parser vale 31.557.600 secondi. ka/kyr, Ma/Myr e Ga/Gyr indicano migliaia, milioni e miliardi di anni. Le carte mostrano valori arrotondati, i confronti usano i secondi completi.
- Per il decadimento esponenziale: N/N₀ = 2^(−t/T½), τ = T½/ln 2. Il cursore rappresenta il valore atteso, non la traiettoria esatta di pochi nuclei.
- LiveChart riassume fino a tre modi di decadimento: non è un elenco esaustivo di ogni ramo. Le risposte del gioco si riferiscono ai dati riportati.
- EC+B+ è un ramo combinato. Le estrazioni beta+ vengono consultate per distinguere intensità di positroni e cattura elettronica, senza attribuire automaticamente entrambe a ogni carta. Le somme sono quelle delle intensità riportate, non nuove valutazioni raccomandate.
- I colori privilegiano i rami con intensità almeno 1%, più l’indicatore gamma del mazzo originale. I rami deboli possono dare una risposta positiva senza mostrare un colore.
- Le righe gamma hanno intensità almeno 1%; la scheda mostra al massimo le otto più intense. Le righe X calcolate vengono escluse richiedendo il livello nucleare iniziale. Si seleziona lo stato del genitore.
- “Riga gamma più intensa” significa la più intensa documentata nell’estratto filtrato, non il fotone di energia massima. Se manca, la risposta è “dato non supportato”.
- La riga 661,657 keV associata al Cs-137 proviene da Ba-137m; il servizio etichetta il nuclide figlio Ba-137. Tc-99m usa il livello a 142,6836 keV e conserva il piccolo ramo beta meno riportato oltre alla transizione isomerica.
- ENSDF esprime l’incertezza sulle ultime cifre: 4,12 (3) h = 4,12 ± 0,03 h.
- I cinque valori termici di cattura sono ereditati dalla precedente versione (riferimento dichiarato INDC(NDS)-440, neutroni a 2200 m/s). L’estensione NGATLAS non è stata validata e non è attiva. Cattura, assorbimento e fissione sono quantità diverse. Un dato assente non vale zero, neppure in una domanda negata.
- Le applicazioni sono associazioni didattiche del mazzo; una risposta negativa non dimostra l’assenza di qualunque studio nel mondo.

Esempi: «La riga gamma più intensa è maggiore di 0,6 MeV?»; “Is its strongest gamma line above 0.6 MeV?”; «La raie gamma la plus intense est-elle supérieure à 0,6 MeV ?».

Fonti: [Guida API LiveChart](https://www-nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html), [notebook ufficiale](https://iaea-nds.github.io/lc_api_notebook/), [NGATLAS](https://www-nds.iaea.org/ngatlas2/).

Strumento didattico indipendente, senza certificazione IAEA; non destinato a dosimetria, scelte terapeutiche o progettazione di schermature.
