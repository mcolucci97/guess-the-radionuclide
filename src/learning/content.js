// Editable Learning V1 content. Source: supplied V3 FINAL scientific decisions/specification.
// Provisional expert-review status retained. No RRCI item bank is shipped into gameplay.
export const CONTENT_STATUS = 'provisional-expert-review';
export const CONTENT_SOURCE = 'V3 FINAL: LEARNING_ENGINE_SPEC / RRCI_DECISIONS_V01';
const tri=(it,en,fr)=>({it,en,fr});
const labels = [
 ['radioactivity.phenomenon','Radioattività','Radioactivity','Radioactivité'],
 ['radioactivity.natural_and_artificial','Naturale e artificiale','Natural and artificial','Naturel et artificiel'],
 ['radioactivity.risk_context','Rischio e contesto','Risk and context','Risque et contexte'],
 ['radioactivity.irradiation_vs_contamination','Irradiazione e contaminazione','Irradiation and contamination','Irradiation et contamination'],
 ['nuclide.element_vs_isotope','Elemento e isotopo','Element and isotope','Élément et isotope'],
 ['decay.alpha','Decadimento α','Alpha decay','Désintégration α'],
 ['decay.beta_minus','Decadimento β−','Beta-minus decay','Désintégration β−'],
 ['decay.beta_plus','Decadimento β+','Beta-plus decay','Désintégration β+'],
 ['decay.electron_capture','Cattura elettronica','Electron capture','Capture électronique'],
 ['radiation.gamma','Radiazione γ','Gamma radiation','Rayonnement γ'],
 ['concept.decay_mode_vs_radiation','Decadimento e radiazione emessa','Decay and emitted radiation','Désintégration et rayonnement émis'],
 ['half_life.concept','Tempo di dimezzamento','Half-life','Période radioactive'],
 ['half_life.order_of_magnitude','Scale dell’emivita','Half-life scales','Échelles de période'],
 ['medical.pet','PET','PET','TEP'], ['medical.spect','SPECT','SPECT','TEMP'],
 ['medical.therapy','Terapia con radionuclidi','Radionuclide therapy','Thérapie par radionucléides'],
 ['medical.pet_beta_plus_link','PET e β+','PET and β+','TEP et β+'],
 ['medical.spect_gamma_link','SPECT e γ','SPECT and γ','TEMP et γ'],
 ['application.environment','Ambiente','Environment','Environnement'],
 ['application.natural_radioactivity','Radioattività naturale','Natural radioactivity','Radioactivité naturelle'],
 ['application.radon','Radon','Radon','Radon'],
 ['application.cosmogenic_astronomy','Cosmogenici e astronomia','Cosmogenic nuclides and astronomy','Cosmogéniques et astronomie'],
 ['application.industry','Industria','Industry','Industrie'],
 ['application.research','Ricerca','Research','Recherche'],
 ['application.dating_geoscience','Datazione e geoscienze','Dating and geoscience','Datation et géosciences'],
 ['reasoning.yes_no_classification','Classificare con sì/no','Yes/no classification','Classification oui/non'],
 ['reasoning.discriminating_question','Domande discriminanti','Discriminating questions','Questions discriminantes'],
 ['nuclide.Z','Protoni Z','Protons Z','Protons Z'],['nuclide.A','Numero di massa A','Mass number A','Nombre de masse A'],
 ['nuclide.N','Neutroni N','Neutrons N','Neutrons N'],['nuclide.N_equals_A_minus_Z','N = A − Z','N = A − Z','N = A − Z'],
 ['half_life.log_scale','Scale logaritmiche','Logarithmic scales','Échelles logarithmiques'],
 ['half_life.quantitative','Emivita quantitativa','Quantitative half-life','Période quantitative'],
 ['decay.beta_plus_vs_ec','β+ e cattura elettronica','β+ and electron capture','β+ et capture électronique'],
 ['radiation.gamma_transition','Transizione γ','Gamma transition','Transition γ'],
 ['medical.pet_annihilation','Annichilazione nella PET','PET annihilation','Annihilation en TEP'],
 ['medical.therapy_alpha','Terapia α','Alpha therapy','Thérapie α'],
 ['medical.therapy_beta_minus','Terapia β−','Beta-minus therapy','Thérapie β−'],
 ['radioactivity.activation_nuance','Attivazione nucleare','Nuclear activation','Activation nucléaire'],
 ['reasoning.quantitative_threshold','Soglie quantitative','Quantitative thresholds','Seuils quantitatifs'],
 ['reasoning.question_information','Informazione della domanda','Question information','Information d’une question'],
 ['chemistry.family','Famiglia chimica','Chemical family','Famille chimique'],
 ['chemistry.metallicity','Metalli e non metalli','Metals and nonmetals','Métaux et non-métaux'],
 ['chemistry.group_period','Gruppo e periodo','Group and period','Groupe et période'],
 ['chemistry.physical_state','Stato fisico','Physical state','État physique'],
 ['chemistry.melting_point','Temperatura di fusione','Melting point','Température de fusion'],
];
export const conceptLabels=Object.fromEntries(labels.map(([id,...values])=>[id,tri(...values)]));
export const conceptLabel=(id,lang)=>conceptLabels[id]?.[lang]||id;
export const corrections = {
 'misconception.radioactive_means_artificial':{concept:'radioactivity.natural_and_artificial',text:tri('Esistono radionuclidi naturali e radionuclidi prodotti artificialmente.','Radionuclides occur naturally and can also be produced artificially.','Des radionucléides existent naturellement et peuvent aussi être produits artificiellement.')},
 'misconception.radioactive_means_always_extremely_dangerous':{concept:'radioactivity.risk_context',text:tri('Il rischio dipende da quantità, emissioni e condizioni di esposizione.','Risk depends on quantity, emissions and exposure conditions.','Le risque dépend de la quantité, des émissions et des conditions d’exposition.')},
 'misconception.different_isotope_means_different_element':{concept:'nuclide.element_vs_isotope',text:tri('Gli isotopi dello stesso elemento condividono Z e differiscono per N.','Isotopes of one element share Z and differ in N.','Les isotopes d’un même élément partagent Z et diffèrent par N.')},
 'misconception.longer_half_life_means_more_dangerous':{concept:'radioactivity.risk_context',text:tri('L’emivita, da sola, non stabilisce il rischio di esposizione.','Half-life alone does not determine exposure risk.','La période seule ne détermine pas le risque d’exposition.')},
 'misconception.beta_plus_equals_gamma':{concept:'concept.decay_mode_vs_radiation',text:tri('β+ indica emissione di un positrone; γ indica un fotone.','β+ denotes positron emission; γ denotes a photon.','β+ désigne l’émission d’un positon ; γ désigne un photon.')},
 'misconception.pet_nuclide_directly_emits_pet_gammas':{concept:'medical.pet_annihilation',text:tri('Nella PET i fotoni rivelati derivano dall’annichilazione del positrone con un elettrone.','In PET, the detected photons arise from positron–electron annihilation.','En TEP, les photons détectés proviennent de l’annihilation du positon avec un électron.')},
 'misconception.gamma_is_identical_to_beta_decay_mode':{concept:'concept.decay_mode_vs_radiation',text:tri('Un’emissione γ può seguire un decadimento β: descrivono processi distinti.','Gamma emission can follow beta decay: they describe distinct processes.','Une émission γ peut suivre une désintégration β : ce sont des processus distincts.')},
 'misconception.irradiation_equals_contamination':{concept:'radioactivity.irradiation_vs_contamination',text:tri('Ricevere radiazione non implica il trasferimento di materiale radioattivo.','Receiving radiation does not imply transfer of radioactive material.','Recevoir un rayonnement n’implique pas un transfert de matière radioactive.')},
 'misconception.irradiation_always_makes_radioactive':{concept:'radioactivity.irradiation_vs_contamination',text:tri('Nelle esposizioni ordinarie, ricevere radiazione non rende automaticamente radioattivi.','In ordinary exposures, receiving radiation does not automatically make someone or something radioactive.','Dans les expositions ordinaires, recevoir un rayonnement ne rend pas automatiquement radioactif.')},
};
const option=(id,text,misconceptionId)=>({id,text,misconceptionId});
// Short relations, separate from research test wording. Used only after a relevant gameplay question.
export const relations = {
 'decay.alpha':[
  option('alpha',tri('α: 2 protoni e 2 neutroni','α: 2 protons and 2 neutrons','α : 2 protons et 2 neutrons')),
  option('photon',tri('α: un fotone','α: a photon','α : un photon')),
  option('electron',tri('α: un elettrone','α: an electron','α : un électron'))],
 'decay.beta_minus':[
  option('neutron',tri('β−: un neutrone diventa un protone','β−: a neutron becomes a proton','β− : un neutron devient un proton')),
  option('proton',tri('β−: un protone diventa un neutrone','β−: a proton becomes a neutron','β− : un proton devient un neutron')),
  option('gamma',tri('β− e γ sono lo stesso processo','β− and γ are the same process','β− et γ sont le même processus'),'misconception.gamma_is_identical_to_beta_decay_mode')],
 'decay.beta_plus':[
  option('positron',tri('β+: emissione di un positrone','β+: positron emission','β+ : émission d’un positon')),
  option('gamma',tri('β+ è un altro nome per γ','β+ is another name for γ','β+ est un autre nom pour γ'),'misconception.beta_plus_equals_gamma'),
  option('proton',tri('β+: emissione di un protone','β+: proton emission','β+ : émission d’un proton'))],
 'decay.electron_capture':[
  option('capture',tri('EC: un elettrone atomico è catturato dal nucleo','EC: an atomic electron is captured by the nucleus','EC : un électron atomique est capturé par le noyau')),
  option('beta',tri('EC significa emissione β−','EC means β− emission','EC signifie émission β−')),
  option('detector',tri('EC: un rivelatore cattura un fotone','EC: a detector captures a photon','EC : un détecteur capture un photon'))],
 'radiation.gamma':[
  option('transition',tri('γ: un fotone di diseccitazione nucleare','γ: a photon from nuclear de-excitation','γ : un photon de désexcitation nucléaire')),
  option('beta',tri('γ equivale al decadimento β−','γ is equivalent to β− decay','γ équivaut à la désintégration β−'),'misconception.gamma_is_identical_to_beta_decay_mode'),
  option('positron',tri('γ: un positrone','γ: a positron','γ : un positon'),'misconception.beta_plus_equals_gamma')],
 'radioactivity.natural_and_artificial':[
  option('both',tri('La radioattività può avere origine naturale o artificiale','Radioactivity can have natural or artificial origins','La radioactivité peut être d’origine naturelle ou artificielle')),
  option('artificial',tri('Tutti i radionuclidi sono artificiali','All radionuclides are artificial','Tous les radionucléides sont artificiels'),'misconception.radioactive_means_artificial'),
  option('danger',tri('Radioattivo significa sempre estremamente pericoloso','Radioactive always means extremely dangerous','Radioactif signifie toujours extrêmement dangereux'),'misconception.radioactive_means_always_extremely_dangerous')],
 'medical.pet':[
  option('positron',tri('PET: positroni, poi fotoni di annichilazione','PET: positrons, then annihilation photons','TEP : positons, puis photons d’annihilation')),
  option('direct',tri('PET: il nucleo emette direttamente la coppia di fotoni rilevati','PET: the nucleus directly emits the detected photon pair','TEP : le noyau émet directement la paire de photons détectés'),'misconception.pet_nuclide_directly_emits_pet_gammas'),
  option('alpha',tri('PET: rivelazione di particelle α','PET: detecting α particles','TEP : détection de particules α'))],
 'medical.spect':[
  option('gamma',tri('SPECT: rivelazione di fotoni adatti con una gamma camera','SPECT: detecting suitable photons with a gamma camera','TEMP : détection de photons adaptés avec une gamma-caméra')),
  option('alpha',tri('SPECT: rivelazione delle sole particelle α','SPECT: detecting only α particles','TEMP : détection des seules particules α')),
  option('identical',tri('SPECT e PET hanno sempre lo stesso principio','SPECT and PET always have the same principle','TEMP et TEP ont toujours le même principe'))],
 'half_life.concept':[
  option('half',tri('Dopo T½ rimane in media metà dei nuclei iniziali','After T½, half the initial nuclei remain on average','Après T½, la moitié des noyaux initiaux reste en moyenne')),
  option('zero',tri('Dopo T½ non rimane nessun nucleo radioattivo','After T½, no radioactive nuclei remain','Après T½, aucun noyau radioactif ne reste')),
  option('risk',tri('Un T½ più lungo implica sempre un rischio maggiore','A longer T½ always implies greater risk','Un T½ plus long implique toujours un risque plus élevé'),'misconception.longer_half_life_means_more_dangerous')],
 'nuclide.N':[
  option('subtract',tri('N = A − Z','N = A − Z','N = A − Z')),
  option('sum',tri('N = A + Z','N = A + Z','N = A + Z')),
  option('equal',tri('N = Z per ogni radionuclide','N = Z for every radionuclide','N = Z pour chaque radionucléide'))],
 'nuclide.element_vs_isotope':[
  option('sameZ',tri('Stesso Z, diverso N: isotopi dello stesso elemento','Same Z, different N: isotopes of one element','Même Z, N différent : isotopes du même élément')),
  option('different',tri('Isotopi diversi sono sempre elementi diversi','Different isotopes are always different elements','Des isotopes différents sont toujours des éléments différents'),'misconception.different_isotope_means_different_element'),
  option('sameA',tri('Lo stesso A identifica sempre lo stesso elemento','The same A always identifies the same element','Le même A identifie toujours le même élément'))],
 'radioactivity.irradiation_vs_contamination':[
  option('exposure',tri('L’irradiazione ordinaria non implica contaminazione né rende automaticamente radioattivi','Ordinary irradiation implies neither contamination nor automatically becoming radioactive','L’irradiation ordinaire n’implique ni contamination ni le fait de devenir automatiquement radioactif')),
  option('contamination',tri('Ricevere radiazione significa ricevere materiale radioattivo','Receiving radiation means receiving radioactive material','Recevoir un rayonnement signifie recevoir de la matière radioactive'),'misconception.irradiation_equals_contamination'),
  option('activation',tri('Ricevere radiazione rende sempre radioattivi','Receiving radiation always makes someone or something radioactive','Recevoir un rayonnement rend toujours radioactif'),'misconception.irradiation_always_makes_radioactive')],
};
export function relationFor(conceptIds, actionId='', query=null) {
  // These relations are prompted only by a concrete, relevant property question.
  // Asking that property alone never supplies evidence of the related mechanism.
  const contextual=query?.property==='Z'?'nuclide.element_vs_isotope':
    ['industry.sterilisation','industry.radiography'].includes(query?.conceptId)?'radioactivity.irradiation_vs_contamination':null;
  const conceptId=contextual||conceptIds.find(id=>relations[id]); if(!conceptId)return null;
  const options=relations[conceptId].map(o=>({...o})), correctId=options[0].id;
  // Stable deterministic rotation, never an always-first answer key.
  const offset=[...actionId].reduce((n,c)=>n+c.charCodeAt(0),0)%options.length;
  return {kind:'relation',conceptIds:[conceptId],options:[...options.slice(offset),...options.slice(0,offset)],correctId};
}
