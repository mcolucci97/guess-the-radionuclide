import pathlib,json,xml.etree.ElementTree as E
R=pathlib.Path(__file__).resolve().parents[1];source=json.loads((R/'src/data/tutorial-it.json').read_text())
# V3 uses independently editable IT/EN/FR content; never overwrite it with V2 copy.
if source.get('version') == 3:
 raise SystemExit('Tutorial V3: edit src/data/tutorial-{it,en,fr}.json directly. This legacy V2 generator is disabled for V3.')
# Authored scientific teaching text, keyed to each original diagram.
text={
'atom-card':('An atom that changes','A radionuclide has an unstable nucleus that can transform and release particles or radiation. Observe the clues and ask yes/no questions.','Un atome qui change','Un radionucléide possède un noyau instable pouvant se transformer et émettre des particules ou des rayonnements. Observez les indices et posez des questions oui/non.'),
'colours':('Colours as clues','Yellow represents alpha, blue beta-minus, and orange positrons or electron capture. Colours simplify the main branches; weak branches may appear only in the scientific record.','Les couleurs comme indices','Le jaune représente alpha, le bleu bêta moins et l’orange les positons ou la capture électronique. Les couleurs simplifient les branches principales ; les branches faibles restent dans les données.'),
'applications':('From everyday life to space','Medicine, nature, homes, food, industry and space are broad categories. Start with broad questions, then ask about specific applications when few cards remain.','Du quotidien à l’espace','Médecine, nature, maisons, aliments, industrie et espace sont de grandes catégories. Commencez par des questions larges, puis précisez les applications lorsqu’il reste peu de cartes.'),
'half-life':('Half-life','After one half-life, about half the original radioactive nuclei remain. Eight becomes four, then two: these are expected numbers; individual decays are random. Activity is measured in becquerels (Bq).','Période radioactive','Après une période, environ la moitié des noyaux radioactifs initiaux subsiste. Huit devient quatre, puis deux : ce sont des moyennes ; chaque désintégration est aléatoire. L’activité se mesure en becquerels (Bq).'),
'stories':('Memorable stories','Radon in homes, potassium-40 in the body, carbon-14 dating and medical imaging provide memorable clues. The game tests the documented associations on its cards.','Histoires mémorables','Radon des maisons, potassium-40 du corps, datation au carbone-14 et imagerie médicale donnent des indices mémorables. Le jeu utilise les associations documentées sur ses cartes.'),
'nucleus':('Protons and neutrons','Protons determine the element. Isotopes share the same proton number but have different neutron numbers. Ask whether there are more than twenty protons or thirty neutrons.','Protons et neutrons','Les protons déterminent l’élément. Ses isotopes partagent le nombre de protons mais ont des nombres de neutrons différents. Demandez s’il possède plus de vingt protons ou trente neutrons.'),
'zan':('Z, A and N','Z is the proton number, A the mass number and N = A − Z the neutron number. Each card describes a particular radionuclide, not just its chemical element.','Z, A et N','Z est le nombre de protons, A le nombre de masse et N = A − Z le nombre de neutrons. Chaque carte décrit un radionucléide précis, pas seulement son élément chimique.'),
'decays':('Alpha, beta and gamma','Alpha particles usually have a short range. Beta radiation consists of electrons or positrons. Gamma rays are photons. Penetration depends on energy and the material traversed.','Alpha, bêta et gamma','Les particules alpha ont généralement un parcours court. Le rayonnement bêta est constitué d’électrons ou de positons. Les gamma sont des photons. La pénétration dépend de l’énergie et du matériau traversé.'),
'half-life-clock':('Time scales','Ask about seconds, minutes, hours, days, months or years, or use a numeric comparison. Intermediate and expert games allow two time questions per player. Displayed values are rounded; comparisons use full stored seconds.','Échelles de temps','Interrogez secondes, minutes, heures, jours, mois ou années, ou utilisez une comparaison numérique. Les niveaux intermédiaire et expert permettent deux questions temporelles par joueur. Les valeurs affichées sont arrondies ; les comparaisons utilisent les secondes complètes.'),
'expert-map':('Expert questions','Explore Z/A/N, chemical families, physical state, melting point, decay modes and nuclear applications. Missing numerical data are never replaced by zero. Check the proposed interpretation before confirming.','Questions expertes','Explorez Z/A/N, familles chimiques, état physique, fusion, désintégrations et applications nucléaires. Une valeur absente ne signifie jamais zéro. Vérifiez l’interprétation avant de confirmer.'),
'mean-life':('Half-life and mean life','For exponential decay, N(t) = N₀ exp(−λt), T½ = ln 2 / λ and mean life τ = 1 / λ = T½ / ln 2. Both half-life and mean-life questions use the shared time-question allowance.','Période et vie moyenne','Pour une décroissance exponentielle, N(t) = N₀ exp(−λt), T½ = ln 2 / λ et τ = 1 / λ = T½ / ln 2. Période et vie moyenne partagent la limite des questions temporelles.'),
'capture':('Neutron capture','Cross section is measured in barns and depends on the target, reaction and neutron energy. Capture (n,γ) differs from total absorption. The five inherited numerical values refer to thermal neutrons at 2200 m/s.','Capture neutronique','La section efficace se mesure en barns et dépend de la cible, de la réaction et de l’énergie. La capture (n,γ) diffère de l’absorption totale. Les cinq valeurs héritées concernent les neutrons thermiques à 2200 m/s.'),
'chemistry':('Properties of the element','Chemical family, state and melting point describe the element. Decay and half-life describe the radionuclide. Distinguish alkali metals from alkaline earth metals, and transition from post-transition metals.','Propriétés de l’élément','Famille chimique, état et température de fusion décrivent l’élément. Désintégration et période décrivent le radionucléide. Distinguez métaux alcalins et alcalino-terreux, métaux de transition et post-transition.'),
'ngatlas':('NGATLAS data','NGATLAS reports capture cross sections versus energy. This release preserves five values from the earlier game. The wider import was not validated and remains disabled. Missing data do not mean zero.','Données NGATLAS','NGATLAS fournit la capture en fonction de l’énergie. Cette version conserve cinq valeurs du jeu précédent. L’import étendu n’a pas été validé et reste désactivé. Une donnée absente ne signifie pas zéro.'),
'decay-chain':('Chains and relationships','A radionuclide may be a fission product, a natural-chain member, a generator parent or daughter, or an activation product. These are different relationships.','Chaînes et relations','Un radionucléide peut être produit de fission, membre d’une chaîne naturelle, parent ou fils d’un générateur, ou produit d’activation. Ce sont des relations différentes.')}
for lang,offset in [('en',0),('fr',2)]:
 d=json.loads(json.dumps(source))
 for levels in d.values():
  for cards in levels.values():
   for i,c in enumerate(cards):
    t=text[c['img']];c.update(title=f'{i+1} · '+t[offset],body=t[offset+1],chips=['Z / A / N']if c['img']in['nucleus','zan']else [])
 (R/f'src/data/tutorial-{lang}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
# Retain the original vector drawings. Translate short labels; replace long Italian
# diagram captions with concise topic-specific captions. The complete explanation
# is in the accessible HTML immediately below each diagram.
labels='''medicina|medicine|médecine
natura|nature|nature
casa|homes|maisons
spazio|space|espace
chimica|chemistry|chimie
decadimenti|decays|désintégrations
contesti|contexts|contextes
neutroni|neutrons|neutrons
giallo|yellow|jaune
azzurro|blue|bleu
arancio|orange|orange
alogeno|halogen|halogène
gas nobile|noble gas|gaz noble
attinide|actinide|actinide
neutrone|neutron|neutron
energia del neutrone|neutron energy|énergie du neutron
sezione d’urto|cross section|section efficace
probabilità di cattura|capture cross section|section de capture
dipende dall’energia|depends on energy|dépend de l’énergie
unità: barn|unit: barn|unité : barn
Z = protoni|Z = protons|Z = protons
decide l’elemento|defines the element|définit l’élément
A = protoni + neutroni|A = protons + neutrons|A = protons + neutrons
numero di massa|mass number|nombre de masse
numero di neutroni|neutron number|nombre de neutrons
α alfa|α alpha|α alpha
pesante|heavy particle|particule lourde
si ferma presto|usually short range|parcours souvent court
foglio / pelle|energy-dependent|selon l’énergie
β beta|β beta|β bêta
elettrone|electron / positron|électron / positon
penetrazione media|energy-dependent|selon l’énergie
alluminio sottile|material-dependent|selon le matériau
onda / energia|photon|photon
molto penetrante|often penetrating|souvent pénétrant
piombo / cemento|material-dependent|selon le matériau
tempo per dimezzare|time to halve|temps de moitié
vita media|mean life|vie moyenne
ore|hours|heures
giorni|days|jours
mesi|months|mois
anni|years|années
inizio|start|début
8 nuclei|8 nuclei|8 noyaux
4 nuclei|4 nuclei|4 noyaux
2 nuclei|2 nuclei|2 noyaux'''
lookup={r[0]:r[1:]for r in [l.split('|')for l in labels.splitlines()]};E.register_namespace('','http://www.w3.org/2000/svg')
for lang,idx in [('it',0),('en',0),('fr',1)]:
 out=R/'tutorial'/lang;out.mkdir(exist_ok=True)
 for p in (R/'tutorial').glob('*.svg'):
  tree=E.parse(p);titleUsed=False
  if lang!='it':
   for el in tree.iter():
    if not el.tag.endswith('text')or not el.text:continue
    value=el.text
    if value in lookup:el.text=lookup[value][idx]
    elif any(w in value.lower()for w in ['domande','modalità','catene','storie','dati','nel ','la ','tre ','alfa,','emivita','scale ','atomo','un radionuclide','tempo di','protoni e','i protoni','prima ','poi ','esempio','ngatlas:','ogni storia']):
     el.text=text[p.stem][0 if lang=='en'else 2]if not titleUsed else '';titleUsed=True
  tree.write(out/p.name,encoding='utf-8',xml_declaration=True)
