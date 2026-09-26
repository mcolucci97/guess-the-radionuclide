import TutorialEntry from "./tutorial/Entry.jsx";
import {useLearning} from "./learning/useLearning.js";
import {LearningPanel, LearningRecap} from "./learning/LearningPanel.jsx";
import {selectDeck} from "./learning/adaptiveDeck.js";
import {localId} from "./learning/playerModel.js";
import {describeQuestion, propertyText} from "./learning/gameplay.js";
import {LEVELS, learningLevel, legacyLevel, normalConfig} from "./learning/levels.js";
import {learningText} from "./learning/i18n.js";
import {multiplayerText} from "./multiplayer/i18n.js";
import {OnlineGame} from "./multiplayer/OnlineGame.jsx";
import {formatQuery} from "./engine/advanced.js";
import {EvidencePanel} from "./ui/EvidencePanel.js";
import * as _ from "react";
import * as j from "react/jsx-runtime";
import * as v from "react-dom/client";
import {
  Atom as ie,
  BookOpen as ae,
  Earth as oe,
  Info as se,
  Play as ce,
  RotateCcw as le,
  Search as ue,
  Sparkles as T,
  X as E,
} from "lucide-react";
import {
  de,
  fe,
  pe,
  me,
  D,
  O,
  k,
  he,
  ge,
  _e,
  ve,
  A,
  ye,
  be,
  xe,
  Se,
  Ce,
  we,
  Te,
  Ee,
  De,
  Oe,
  ke,
  Ae,
  je,
  Me,
  Ne,
  Pe,
  Fe,
  Ie,
  Le,
  Re,
  ze,
  Be,
  Ve,
  He,
  Ue,
  We,
  Ge,
  Ke,
  qe,
  Je,
  Ye,
  Xe,
  Ze,
  Qe,
  $e,
  et,
  tt,
} from "./engine/advanced.js";
import { MODEL_ID as ot, MODEL_AVAILABLE, loadLocalLLM as ut } from "./engine/llm.js";
var ft = `https://doi.org/10.15161/oar.it/77027`,
  pt = [
    ...Object.values(pe),
    {
      label: `Orano · All about radioactivity`,
      url: `https://www.orano.group/en/unpacking-nuclear/all-about-radioactivity`,
    },
    {
      label: `IAEA · Radiation in Everyday Life`,
      url: `https://www.iaea.org/Publications/Factsheets/English/radlife`,
    },
    {
      label: `BBC Bitesize · Radioactivity`,
      url: `https://www.bbc.co.uk/bitesize/articles/znf4xg8`,
    },
  ],
  mt = ``,
  ht = `3.0.0-scientific-upgrade`,
  gt = {
    it: {
      title: `Indovina il Radionuclide`,
      subtitle: `Un gioco radioattivo per i fisici del futuro!`,
      play: `Gioca`,
      atlas: `Atlante`,
      about: `Crediti e fonti`,
      setup: `Configura partita`,
      mode: `Modalità`,
      soloEasy: `Singolo · didattico`,
      soloHard: `Singolo · sfida`,
      local: `Due giocatori · un dispositivo`,
      age: `Età`,
      level: `Livello dei contenuti`,
      explorer: `Esploratore`,
      curious: `Curioso`,
      scientist: `Scienziato`,
      expert: `Esperto`,
      assistance: `Eliminazione carte`,
      assisted: `Semplificata · automatica`,
      manual: `Normale · manuale`,
      deck: `Dimensione mazzo`,
      full: `Tutte`,
      start: `Inizia la partita`,
      pickSolo: `Scegli la tua carta segreta`,
      pick1: `Giocatore 1, scegli la tua carta segreta`,
      pick2: `Passa il dispositivo. Giocatore 2, scegli la propria carta segreta`,
      hide: `Carta del primo giocatore selezionata: non mostrarla all’avversario.`,
      turn: `Turno`,
      player: `Giocatore`,
      computer: `Computer`,
      secret: `La tua carta`,
      openMine: `Vedi proprietà della mia carta`,
      typeQuestion: `Formula una domanda a cui rispondere SÌ o NO`,
      placeholder: `Es. Posso trovarlo in un’insalata coltivata a Chernobyl?`,
      submit: `Fai la domanda`,
      guess: `Tenta di indovinare`,
      quick: `Domande suggerite`,
      candidates: `carte possibili`,
      answer: `Risposta`,
      yes: `SÌ`,
      no: `NO`,
      learn: `Verifica della risposta`,
      answerInstruction: `Ora elimina manualmente le carte incompatibili, poi passa al turno successivo.`,
      automaticInstruction: `Le carte incompatibili sono state eliminate automaticamente. Puoi controllare il tabellone prima di continuare.`,
      nextTurn: `Ho finito · turno successivo`,
      computerAsks: `Il computer domanda:`,
      respond: `Rispondi alla domanda dell’avversario`,
      pass: `Passa il dispositivo al giocatore che deve rispondere.`,
      inconsistent: `Questa risposta non è coerente con la carta segreta. L’app controlla senza rivelarla: riprova.`,
      wrongGuess: `Tentativo errato: la partita continua.`,
      winner: `ha indovinato!`,
      reveal: `La carta segreta era`,
      newGame: `Nuova partita`,
      search: `Cerca radionuclide o storia`,
      all: `Tutti`,
      natural: `Naturali / NORM`,
      medical: `Medicina`,
      cosmos: `Cosmogenici`,
      fission: `Fissione / reattori`,
      environment: `Ambiente`,
      industry: `Industria`,
      mass: `Numero di massa`,
      neutrons: `Neutroni`,
      halfLife: `Tempo di dimezzamento`,
      didYouKnow: `Lo sapevi che…`,
      original: `Mazzo originale`,
      expanded: `Espansione candidata`,
      sourceStatus: `Stato editoriale`,
      credits: `Versione digitale sviluppata da Michele Colucci sulla base del gioco originale “Indovina il Radionuclide”, realizzato nell’ambito del progetto RadioLAB dell’Istituto Nazionale di Fisica Nucleare (INFN).`,
      dataNote: `Emivite e rami: estratti IAEA tracciabili. Storie, chimica e cinque valori di cattura: contenuti della versione precedente, non rivalidati integralmente in questa revisione.`,
      aiFair: `Il computer ragiona solo sui candidati rimasti: non legge mai la tua carta segreta.`,
      opponentCount: `All’avversario restano`,
      opponentCountHint: `Usa questo numero per decidere se tentare di indovinare o fare un’altra domanda.`,
      timeHint: `Per l’emivita puoi scrivere anche domande naturali: “decade in meno di 3 anni?”, “vive più di 1 giorno?” oppure “non supera 10 ore?”.`,
      questionUnknown: `Non ho ancora interpretato questa domanda. Riformulala o scegli una domanda suggerita.`,
      questionUnsupported: `Domanda sensata, ma richiede un dato avanzato non ancora validato nel database.`,
      questionInvalid: `La domanda deve ammettere una risposta SÌ o NO.`,
      tests: `Controlli logici interni`,
      testOk: `superati`,
      testFail: `falliti`,
    },
    en: {
      title: `Guess the Radionuclide`,
      subtitle: `A radioactive game for tomorrow's physicists!`,
      play: `Play`,
      atlas: `Atlas`,
      about: `Credits & sources`,
      setup: `Set up match`,
      mode: `Mode`,
      soloEasy: `Solo · learning`,
      soloHard: `Solo · challenge`,
      local: `Two players · one device`,
      age: `Age`,
      level: `Content level`,
      explorer: `Explorer`,
      curious: `Curious`,
      scientist: `Scientist`,
      expert: `Expert`,
      assistance: `Card elimination`,
      assisted: `Simplified · automatic`,
      manual: `Normal · manual`,
      deck: `Deck size`,
      full: `All`,
      start: `Start match`,
      pickSolo: `Choose your secret card`,
      pick1: `Player 1, choose your secret card`,
      pick2: `Pass the device. Player 2, choose a secret card`,
      hide: `Player 1's card is selected: do not show it to the opponent.`,
      turn: `Turn`,
      player: `Player`,
      computer: `Computer`,
      secret: `Your card`,
      openMine: `View my card properties`,
      typeQuestion: `Ask a YES/NO question`,
      placeholder: `E.g. Could I find it in lettuce grown at Chernobyl?`,
      submit: `Ask`,
      guess: `Make a guess`,
      quick: `Suggested questions`,
      candidates: `possible cards`,
      answer: `Answer`,
      yes: `YES`,
      no: `NO`,
      learn: `Answer verification`,
      answerInstruction: `Now eliminate incompatible cards manually, then move to the next turn.`,
      automaticInstruction: `Incompatible cards have been automatically eliminated. Check the board before continuing.`,
      nextTurn: `Finished · next turn`,
      computerAsks: `Computer asks:`,
      respond: `Answer the opponent's question`,
      pass: `Pass the device to the player who must answer.`,
      inconsistent: `This answer does not match the secret card. The app checks without revealing it: try again.`,
      wrongGuess: `Wrong guess: the match continues.`,
      winner: `guessed correctly!`,
      reveal: `The secret card was`,
      newGame: `New match`,
      search: `Search radionuclide or story`,
      all: `All`,
      natural: `Natural / NORM`,
      medical: `Medicine`,
      cosmos: `Cosmogenic`,
      fission: `Fission / reactors`,
      environment: `Environment`,
      industry: `Industry`,
      mass: `Mass number`,
      neutrons: `Neutrons`,
      halfLife: `Half-life`,
      didYouKnow: `Did you know…`,
      original: `Original deck`,
      expanded: `Candidate expansion`,
      sourceStatus: `Editorial status`,
      credits: `Digital version developed by Michele Colucci, based on the original game “Guess the Radionuclide”, created within the RadioLAB project of the Italian National Institute for Nuclear Physics (INFN).`,
      dataNote: `Half-lives and branches: traceable IAEA extracts. Stories, chemistry and five capture values: retained from the previous version, not fully revalidated in this revision.`,
      aiFair: `The computer reasons only from its remaining candidates: it never reads your secret card.`,
      opponentCount: `Your opponent has`,
      opponentCountHint: `Use this number to decide whether to guess or ask another question.`,
      timeHint: `For half-life questions you can also write naturally: “does it decay in less than 3 years?” or “does it live longer than 1 day?”.`,
      questionUnknown: `I cannot interpret this question yet. Rephrase it or use a suggested question.`,
      questionUnsupported: `Meaningful question, but it requires advanced data not yet validated in the database.`,
      questionInvalid: `The question must be answerable with YES or NO.`,
      tests: `Internal logic checks`,
      testOk: `passed`,
      testFail: `failed`,
    },
    fr: {
      title: `Devine le radionucléide`,
      subtitle: `Un jeu radioactif pour les physiciens du futur !`,
      play: `Jouer`,
      atlas: `Atlas`,
      about: `Crédits et sources`,
      setup: `Configurer la partie`,
      mode: `Mode`,
      soloEasy: `Solo · pédagogique`,
      soloHard: `Solo · défi`,
      local: `Deux joueurs · un appareil`,
      age: `Âge`,
      level: `Niveau des contenus`,
      explorer: `Explorateur`,
      curious: `Curieux`,
      scientist: `Scientifique`,
      expert: `Expert`,
      assistance: `Élimination des cartes`,
      assisted: `Simplifiée · automatique`,
      manual: `Normale · manuelle`,
      deck: `Taille du paquet`,
      full: `Toutes`,
      start: `Commencer`,
      pickSolo: `Choisissez votre carte secrète`,
      pick1: `Joueur 1, choisissez votre carte secrète`,
      pick2: `Passez l’appareil. Joueur 2, choisissez une carte secrète`,
      hide: `La carte du joueur 1 est sélectionnée : ne la montrez pas à l’adversaire.`,
      turn: `Tour`,
      player: `Joueur`,
      computer: `Ordinateur`,
      secret: `Votre carte`,
      openMine: `Voir les propriétés de ma carte`,
      typeQuestion: `Posez une question OUI/NON`,
      placeholder: `Ex. Peut-on le trouver dans une salade cultivée à Tchernobyl ?`,
      submit: `Poser`,
      guess: `Proposer une réponse`,
      quick: `Questions suggérées`,
      candidates: `cartes possibles`,
      answer: `Réponse`,
      yes: `OUI`,
      no: `NON`,
      learn: `Vérification de la réponse`,
      answerInstruction: `Éliminez manuellement les cartes incompatibles, puis passez au tour suivant.`,
      automaticInstruction: `Les cartes incompatibles ont été éliminées automatiquement. Vérifiez le plateau avant de continuer.`,
      nextTurn: `Terminé · tour suivant`,
      computerAsks: `L’ordinateur demande :`,
      respond: `Répondez à la question de l’adversaire`,
      pass: `Passez l’appareil au joueur qui doit répondre.`,
      inconsistent: `Cette réponse ne correspond pas à la carte secrète. L’application contrôle sans la révéler : réessayez.`,
      wrongGuess: `Mauvaise proposition : la partie continue.`,
      winner: `a trouvé !`,
      reveal: `La carte secrète était`,
      newGame: `Nouvelle partie`,
      search: `Chercher un radionucléide ou une histoire`,
      all: `Tous`,
      natural: `Naturels / NORM`,
      medical: `Médecine`,
      cosmos: `Cosmogéniques`,
      fission: `Fission / réacteurs`,
      environment: `Environnement`,
      industry: `Industrie`,
      mass: `Nombre de masse`,
      neutrons: `Neutrons`,
      halfLife: `Période radioactive`,
      didYouKnow: `Le saviez-vous ?`,
      original: `Paquet original`,
      expanded: `Extension candidate`,
      sourceStatus: `Statut éditorial`,
      credits: `Version numérique développée par Michele Colucci, basée sur le jeu original « Devine le radionucléide », réalisé dans le cadre du projet RadioLAB de l’Institut national italien de physique nucléaire (INFN).`,
      dataNote: `Périodes et branches : extraits AIEA traçables. Récits, chimie et cinq valeurs de capture : conservés de la version précédente, sans revalidation intégrale dans cette révision.`,
      aiFair: `L’ordinateur raisonne uniquement sur ses candidats restants : il ne lit jamais votre carte secrète.`,
      opponentCount: `Il reste à votre adversaire`,
      opponentCountHint: `Utilisez ce nombre pour décider de proposer un radionucléide ou de poser une autre question.`,
      timeHint: `Pour la période, vous pouvez aussi écrire naturellement : « décroît-il en moins de 3 ans ? » ou « vit-il plus d’un jour ? ».`,
      questionUnknown: `Je ne comprends pas encore cette question. Reformulez-la ou utilisez une suggestion.`,
      questionUnsupported: `Question pertinente, mais elle exige une donnée avancée pas encore validée dans la base.`,
      questionInvalid: `La question doit admettre une réponse OUI ou NON.`,
      tests: `Contrôles logiques internes`,
      testOk: `réussis`,
      testFail: `échoués`,
    },
  },
  _t = {
    it: {
      learnFirst: `Impara prima di giocare`,
      audience: `Chi giocherà?`,
      audienceHint: `Il pubblico modifica il linguaggio e il tutorial.`,
      child: `Bambin*`,
      adult: `Adult*`,
      depth: `Quanto vuoi approfondire?`,
      depthHint: `Il livello modifica le proprietà visibili e le domande suggerite.`,
      base: `Base`,
      intermediate: `Intermedio`,
      expert: `Esperto`,
      baseHint: `Colori, storie e indizi immediati.`,
      intermediateHint: `Decadimenti, emivita, medicina e ambiente.`,
      expertHint: `Chimica, Z/A/N e interazioni neutroniche.`,
      tutorial: `Prima di giocare`,
      tutorialBack: `Torna alla home`,
      tutorialGo: `Configura la partita`,
      colorLegend: `I colori delle carte`,
      report: `Segnala un problema`,
      reportTitle: `Segnala un problema con questa risposta`,
      reportWhy: `Che cosa non ha funzionato?`,
      misunderstood: `La domanda non è stata capita`,
      wrong: `La risposta era sbagliata`,
      ambiguous: `Era ambigua ma il gioco ha risposto`,
      revealed: `La risposta ha dato un indizio`,
      other: `Altro`,
      notes: `Commento opzionale`,
      saveReport: `Scarica segnalazione JSON`,
      copyReport: `Copia segnalazione`,
      sendReport: `Invia segnalazione`,
      sending: `Invio in corso…`,
      sent: `Segnalazione inviata. Grazie!`,
      sendError: `Invio non riuscito: puoi scaricare il file JSON.`,
      copied: `Segnalazione copiata.`,
      feedbackNote: `Questa versione salva una segnalazione pronta da inviarmi; per invio automatico basta configurare un endpoint esterno.`,
      radiolab: `Sito RadioLAB`,
      originalRepo: `Repository del gioco originale`,
      timeLimit: `Domande sul tempo`,
      timeLimitReached: `Hai già usato le 2 domande sul tempo disponibili per questo livello. Prova con decadimenti, applicazioni, chimica o storie della carta.`,
      timeLimitHint: `In Intermedio ed Esperto puoi usare al massimo 2 domande su emivita/vita media per giocatore.`,
    },
    en: {
      learnFirst: `Learn before playing`,
      audience: `Who will play?`,
      audienceHint: `Audience changes language and tutorial style.`,
      child: `Children`,
      adult: `Adults`,
      depth: `How deep do you want to go?`,
      depthHint: `Level changes visible properties and suggested questions.`,
      base: `Basic`,
      intermediate: `Intermediate`,
      expert: `Expert`,
      baseHint: `Colours, stories and immediate clues.`,
      intermediateHint: `Decay, half-life, medicine and environment.`,
      expertHint: `Chemistry, Z/A/N and neutron interactions.`,
      tutorial: `Before you play`,
      tutorialBack: `Back to home`,
      tutorialGo: `Set up a match`,
      colorLegend: `Card colours`,
      report: `Report a problem`,
      reportTitle: `Report a problem with this answer`,
      reportWhy: `What went wrong?`,
      misunderstood: `The question was not understood`,
      wrong: `The answer was wrong`,
      ambiguous: `It was ambiguous but the game answered`,
      revealed: `The answer gave away a clue`,
      other: `Other`,
      notes: `Optional comment`,
      saveReport: `Download report JSON`,
      copyReport: `Copy report`,
      sendReport: `Send report`,
      sending: `Sending…`,
      sent: `Report sent. Thank you!`,
      sendError: `Sending failed: you can download the JSON file.`,
      copied: `Report copied.`,
      feedbackNote: `This version saves a report ready to send; automatic collection only requires configuring an external endpoint.`,
      radiolab: `RadioLAB website`,
      originalRepo: `Original game repository`,
      timeLimit: `Time questions`,
      timeLimitReached: `You have already used the 2 time questions available at this level. Try asking about emissions, uses, chemistry or card stories.`,
      timeLimitHint: `In Intermediate and Expert you can use at most 2 half-life/mean-life questions per player.`,
    },
    fr: {
      learnFirst: `Apprendre avant de jouer`,
      audience: `Qui va jouer ?`,
      audienceHint: `Le public modifie le langage et le tutoriel.`,
      child: `Enfant*`,
      adult: `Adulte*`,
      depth: `Jusqu’où approfondir ?`,
      depthHint: `Le niveau modifie les propriétés visibles et les questions suggérées.`,
      base: `Base`,
      intermediate: `Intermédiaire`,
      expert: `Expert`,
      baseHint: `Couleurs, histoires et indices immédiats.`,
      intermediateHint: `Désintégrations, période, médecine et environnement.`,
      expertHint: `Chimie, Z/A/N et interactions neutroniques.`,
      tutorial: `Avant de jouer`,
      tutorialBack: `Retour à l’accueil`,
      tutorialGo: `Configurer la partie`,
      colorLegend: `Couleurs des cartes`,
      report: `Signaler un problème`,
      reportTitle: `Signaler un problème avec cette réponse`,
      reportWhy: `Qu’est-ce qui n’a pas fonctionné ?`,
      misunderstood: `La question n’a pas été comprise`,
      wrong: `La réponse était incorrecte`,
      ambiguous: `La question était ambiguë mais le jeu a répondu`,
      revealed: `La réponse a donné un indice`,
      other: `Autre`,
      notes: `Commentaire facultatif`,
      saveReport: `Télécharger le rapport JSON`,
      copyReport: `Copier le rapport`,
      sendReport: `Envoyer le rapport`,
      sending: `Envoi en cours…`,
      sent: `Rapport envoyé. Merci !`,
      sendError: `Échec de l’envoi : vous pouvez télécharger le fichier JSON.`,
      copied: `Rapport copié.`,
      feedbackNote: `Cette version enregistre un rapport prêt à envoyer ; la collecte automatique nécessite simplement un endpoint externe.`,
      radiolab: `Site RadioLAB`,
      originalRepo: `Dépôt du jeu original`,
      timeLimit: `Questions sur le temps`,
      timeLimitReached: `Vous avez déjà utilisé les 2 questions sur le temps disponibles à ce niveau. Essayez les émissions, les usages, la chimie ou les histoires de la carte.`,
      timeLimitHint: `En Intermédiaire et Expert, vous pouvez utiliser au maximum 2 questions sur la période/vie moyenne par joueur.`,
    },
  },
  vt = {
    it: {
      nonmetal: `Non metallo`,
      halogen: `Alogeno`,
      noble_gas: `Gas nobile`,
      alkali_metal: `Metallo alcalino`,
      alkaline_earth_metal: `Metallo alcalino-terroso`,
      transition_metal: `Metallo di transizione`,
      post_transition_metal: `Metallo post-transizione`,
      metalloid: `Metalloide`,
      lanthanide: `Lantanide`,
      actinide: `Attinide`,
    },
    en: {
      nonmetal: `Non-metal`,
      halogen: `Halogen`,
      noble_gas: `Noble gas`,
      alkali_metal: `Alkali metal`,
      alkaline_earth_metal: `Alkaline-earth metal`,
      transition_metal: `Transition metal`,
      post_transition_metal: `Post-transition metal`,
      metalloid: `Metalloid`,
      lanthanide: `Lanthanide`,
      actinide: `Actinide`,
    },
    fr: {
      nonmetal: `Non-métal`,
      halogen: `Halogène`,
      noble_gas: `Gaz noble`,
      alkali_metal: `Métal alcalin`,
      alkaline_earth_metal: `Métal alcalino-terreux`,
      transition_metal: `Métal de transition`,
      post_transition_metal: `Métal post-transition`,
      metalloid: `Métalloïde`,
      lanthanide: `Lanthanide`,
      actinide: `Actinide`,
    },
  },
  yt = {
    it: { solid: `Solido`, gas: `Gas` },
    en: { solid: `Solid`, gas: `Gas` },
    fr: { solid: `Solide`, gas: `Gaz` },
  };
function bt(e, t) {
  return vt[t]?.[e.element.family] || e.element.family;
}
function xt(e, t) {
  return yt[t]?.[e.element.state] || e.element.state;
}
function St(e) {
  return e.sourceKeys.map((e) => pe[e]).filter(Boolean);
}
function Ct(e) {
  return (
    e?.type === `parsed` &&
    (e.queryType === `timeOrder` ||
      e.property === `halfLifeSeconds` ||
      e.property === `meanLifeSeconds` ||
      String(e.conceptId || ``).startsWith(`time.`))
  );
}
function wt(e) {
  e = legacyLevel(e);
  return [`intermediate`, `expert`].includes(e) ? 2 : 1 / 0;
}
function Tt(e, t = `adult`, n = `base`) {
  n = legacyLevel(n);
  let r = [`identity.name_starts_with`];
  (t === `child` &&
    r.push(
      `visual.yellow`,
      `visual.blue`,
      `visual.orange`,
      `visual.multicolour`,
    ),
    [
      `alkali_metal`,
      `alkaline_earth_metal`,
      `transition_metal`,
      `post_transition_metal`,
      `lanthanide`,
      `actinide`,
    ].includes(e.element.family) && r.push(`chemistry.metal`),
    r.push(`chemistry.${e.element.state}_at_room_temperature`),
    (e.concepts.some((e) => e.startsWith(`space.`)) ||
      e.tags.some((e) =>
        [`space`, `stellar`, `supernova`, `meteorite`, `cosmogenic`].includes(
          e,
        ),
      )) &&
      r.push(`space.general`));
  let i = {
    alpha: `physics.alpha`,
    "beta-": `physics.beta_minus`,
    "beta+": `physics.beta_plus`,
    ec: `physics.electron_capture`,
    gamma: `physics.gamma`,
    it: `physics.isomeric_transition`,
    sf: `physics.spontaneous_fission`,
  };
  (e.modes.forEach((e) => {
    i[e] && r.push(i[e]);
  }),
    e.expert?.neutronCapture?.thermalBarn != null &&
      r.push(`expert.ngatlas_capture_data`));
  let a = [...new Set([...e.concepts, ...r])],
    o = [`daily.`, `medical.`, `nature.`, `environment.`, `history.`];
  return t === `child` && n === `base`
    ? a.filter(
        (e) =>
          e.startsWith(`visual.`) ||
          e === `identity.name_starts_with` ||
          e === `space.general` ||
          o.some((t) => e.startsWith(t)),
      )
    : t === `child`
      ? a.filter(
          (e) =>
            !e.startsWith(`expert.`) &&
            !e.startsWith(`chemistry.`) &&
            !e.startsWith(`nuclear.`),
        )
      : n === `base`
        ? a.filter(
            (e) =>
              o.some((t) => e.startsWith(t)) ||
              e === `space.general` ||
              e.startsWith(`physics.`),
          )
        : legacyLevel(n) === `expert`
          ? a
          : a.filter((e) => !e.startsWith(`expert.`));
}
function M({ compact: e = !1 }) {
  return (0, j.jsxs)(`div`, {
    className: `${e ? `text-2xl` : `text-5xl`} font-black tracking-tight leading-none`,
    children: [
      (0, j.jsx)(`span`, {
        className: `text-[#f4d300] drop-shadow-[2px_2px_0_#282828]`,
        children: `Indovina il`,
      }),
      (0, j.jsx)(`br`, {}),
      (0, j.jsx)(`span`, {
        className: `text-[#62b5c0] drop-shadow-[2px_2px_0_#282828]`,
        children: `Radio`,
      }),
      (0, j.jsx)(`span`, {
        className: `text-[#ff704e] drop-shadow-[2px_2px_0_#282828]`,
        children: `Nuclide`,
      }),
    ],
  });
}
function Et({ active: e, onClick: t, children: n }) {
  return (0, j.jsx)(`button`, {
    onClick: t,
    className: `rounded-full px-4 py-2 text-sm font-semibold transition ${e ? `bg-slate-900 text-white shadow-md` : `border border-slate-200 bg-white hover:border-slate-400`}`,
    children: n,
  });
}
function Dt(e, t = `adult`, n = `base`) {
  let r = new Set(e.concepts || []),
    i = [],
    a = (e, t, n) => {
      i.find((t) => t.id === e) || i.push({ id: e, icon: t, label: n });
    };
  ((r.has(`medical.pet`) || r.has(`daily.fdg_pet`)) && a(`pet`, `🧠`, `PET`),
    (r.has(`medical.spect`) || r.has(`daily.scintigraphy`)) &&
      a(`spect`, `📷`, `SPECT`),
    r.has(`medical.therapy`) && a(`therapy`, `🎯`, `Terapia`),
    r.has(`medical.thyroid`) && a(`thyroid`, `🦋`, `Tiroide`),
    r.has(`medical.bone`) && a(`bone`, `🦴`, `Ossa`),
    r.has(`daily.bananas`) && a(`banana`, `🍌`, `Banane`),
    r.has(`daily.home_radon`) && a(`home`, `🏠`, `Case`),
    r.has(`daily.smoke_detector`) && a(`smoke`, `🚨`, `Fumo`),
    r.has(`daily.archaeology`) && a(`arch`, `🏺`, `Datazione`),
    (r.has(`history.fukushima`) ||
      r.has(`history.chernobyl`) ||
      r.has(`environment.nuclear_accident`)) &&
      a(`accident`, `⚠️`, `Incidenti`),
    (e.concepts?.some((e) => e.startsWith(`space.`)) ||
      e.tags?.some((e) =>
        [`space`, `stellar`, `supernova`, `meteorite`, `cosmogenic`].includes(
          e,
        ),
      )) &&
      a(`space`, `🚀`, `Spazio`),
    r.has(`industry.radiography`) && a(`weld`, `🏗️`, `Industria`),
    r.has(`industry.sterilisation`) && a(`sterile`, `🧼`, `Sterile`),
    r.has(`expert.neutron_source`) && a(`neutron`, `⚛️`, `Neutroni`));
  let o = t === `child` ? (n === `base` ? 4 : 6) : 5;
  return i.slice(0, o);
}
function Ot({ card: e, audience: t, level: n, lang="it" }) {
  let r = Dt(e, t, n).map(item=>({...item,label:({en:{therapy:"Therapy",thyroid:"Thyroid",bone:"Bone",banana:"Bananas",home:"Homes",smoke:"Smoke",arch:"Dating",accident:"Accidents",space:"Space",weld:"Industry",sterile:"Sterile",neutron:"Neutrons"},fr:{therapy:"Thérapie",thyroid:"Thyroïde",bone:"Os",banana:"Bananes",home:"Maisons",smoke:"Fumée",arch:"Datation",accident:"Accidents",space:"Espace",weld:"Industrie",sterile:"Stérile",neutron:"Neutrons"}})[lang]?.[item.id]||item.label}));
  return r.length
    ? (0, j.jsx)(`div`, {
        className: `mt-3 flex flex-wrap gap-1.5`,
        children: r.map((e) =>
          (0, j.jsxs)(
            `span`,
            {
              title: e.label,
              className: `inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200`,
              children: [
                (0, j.jsx)(`span`, { children: e.icon }),
                (0, j.jsx)(`span`, { children: e.label }),
              ],
            },
            e.id,
          ),
        ),
      })
    : null;
}
function kt({
  item: e,
  lang: t,
  inactive: n = !1,
  onClick: r,
  compact: i = !1,
  action: a = null,
  audience: o = `adult`,
  level: s = `base`,
  lens = null,
}) {
  return (0, j.jsxs)(`article`, {
    "data-card-id": e.id,
    className: `relative overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${i ? `min-h-[150px]` : `min-h-[205px]`} ${n ? `opacity-40 grayscale` : `hover:-translate-y-1 hover:shadow-lg`}`,
    children: [
      (0, j.jsx)(`div`, {
        className: `absolute left-0 top-0 h-full w-2`,
        style: { background: Ce(e) },
      }),
      (0, j.jsx)(`button`, {
        type: `button`,
        onClick: r,
        className: `block w-full text-left`,
        children: (0, j.jsxs)(`div`, {
          className: i ? `p-3 pl-5` : `p-4 pl-6`,
          children: [
            (0, j.jsx)(`div`, {
              className: `${i ? `text-base` : `text-2xl`} font-bold`,
              children: e.name[t],
            }),
            (0, j.jsx)(`div`, {
              className: `mt-2 text-sm font-semibold text-slate-600`,
              children: Se(e.seconds, t),
            }),
            (0, j.jsx)(`div`, {
              className: `mt-3 flex flex-wrap gap-1`,
              children: e.modes.map((e) =>
                (0, j.jsx)(
                  `span`,
                  {
                    className: `rounded-md border px-2 py-1 text-xs font-bold`,
                    style: { background: de[e] || `white` },
                    children: fe[e],
                  },
                  e,
                ),
              ),
            }),
            o === `child` && (0, j.jsx)(Ot, { card: e, audience: o, level: s, lang:t }),
            !i &&
              (0, j.jsx)(`p`, {
                className: `mt-4 text-xs text-slate-500`,
                children: e.story[t],
              }),
          ],
        }),
      }),
      lens && j.jsx('p',{className:'learning-lens',children:lens}),
      a &&
        (0, j.jsx)(`button`, {
          type: `button`,
          onClick: a.onClick,
          disabled: a.disabled,
          className: `mx-4 mb-4 w-[calc(100%-2rem)] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold hover:bg-slate-100`,
          children: a.label,
        }),
    ],
  });
}
function At({ children: e, close: t }) {
  const dialogRef=_.useRef(null);
  const closeRef=_.useRef(t); closeRef.current=t;
  _.useEffect(()=>{const before=document.activeElement;const box=dialogRef.current;box?.focus();const key=event=>{if(event.key==='Escape'){event.preventDefault();closeRef.current();}if(event.key==='Tab'){const nodes=box.querySelectorAll('button,a[href],input,textarea,select,[tabindex="0"]');if(!nodes.length){event.preventDefault();return;}const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&(document.activeElement===first||document.activeElement===box)){last.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===last){first.focus();event.preventDefault();}}};box?.addEventListener('keydown',key);return()=>{box?.removeEventListener('keydown',key);before?.focus?.();};},[]);
  return (0, j.jsx)(`div`, {
    onClick: t,
    className: `fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4`,
    children: (0, j.jsx)(`div`, {
      onClick: (e) => e.stopPropagation(),
      ref: dialogRef, role: "dialog", "aria-modal": true, "aria-label": "Radionuclide", tabIndex: -1,
      className: `max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`,
      children: e,
    }),
  });
}
function jt({ title: e, children: t }) {
  return (0, j.jsxs)(`section`, {
    className: `mt-7`,
    children: [
      (0, j.jsx)(`h2`, {
        className: `mb-3 text-sm font-bold uppercase tracking-wide text-slate-500`,
        children: e,
      }),
      (0, j.jsx)(`div`, { className: `flex flex-wrap gap-2`, children: t }),
    ],
  });
}
function Mt(e) {
  return (0, j.jsx)(`div`, {
    className: `mt-4 flex flex-wrap gap-2`,
    children: e.map((e) =>
      (0, j.jsx)(
        `span`,
        {
          className: `rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700`,
          children: e,
        },
        e,
      ),
    ),
  });
}
function Pt({ lang: e, context: t, close: n }) {
  let r = _t[e],
    [i, a] = (0, _.useState)(`misunderstood`),
    [o, s] = (0, _.useState)(``),
    [c, l] = (0, _.useState)(``),
    u = {
      createdAt: new Date().toISOString(),
      appVersion: ht,
      language: e,
      audience: t.config.audience,
      level: t.config.level,
      gameMode: t.config.mode,
      question: t.question || ``,
      displayedAnswer: t.answer == null ? null : !!t.answer,
      parserMessage: t.message || ``,
      reason: i,
      comment: o,
    };
  function d() {
    let e = new Blob([JSON.stringify(u, null, 2)], {
        type: `application/json`,
      }),
      t = URL.createObjectURL(e),
      n = document.createElement(`a`);
    ((n.href = t),
      (n.download = `radionuclide-feedback-${Date.now()}.json`),
      n.click(),
      URL.revokeObjectURL(t));
  }
  async function f() {
    try {
      (await navigator.clipboard.writeText(JSON.stringify(u, null, 2)),
        l(r.copied));
    } catch {
      d();
    }
  }
  return (0, j.jsxs)(At, {
    close: n,
    children: [
      (0, j.jsxs)(`div`, {
        className: `flex justify-between gap-3`,
        children: [
          (0, j.jsx)(`h2`, {
            className: `text-2xl font-bold`,
            children: r.reportTitle,
          }),
          (0, j.jsx)(`button`, { onClick: n, children: (0, j.jsx)(E, {}) }),
        ],
      }),
      (0, j.jsxs)(`div`, {
        className: `mt-4 rounded-xl bg-slate-50 p-3 text-sm`,
        children: [
          (0, j.jsx)(`b`, { children: t.question || `—` }),
          t.answer != null &&
            (0, j.jsx)(`div`, {
              className: `mt-1`,
              children: t.answer ? `SÌ / YES / OUI` : `NO / NON`,
            }),
        ],
      }),
      (0, j.jsx)(`p`, {
        className: `mt-5 font-semibold`,
        children: r.reportWhy,
      }),
      (0, j.jsx)(`div`, {
        className: `mt-3 space-y-2`,
        children: [
          [`misunderstood`, r.misunderstood],
          [`wrong`, r.wrong],
          [`ambiguous`, r.ambiguous],
          [`revealed`, r.revealed],
          [`other`, r.other],
        ].map(([e, t]) =>
          (0, j.jsxs)(
            `label`,
            {
              className: `flex gap-2`,
              children: [
                (0, j.jsx)(`input`, {
                  type: `radio`,
                  checked: i === e,
                  onChange: () => a(e),
                }),
                t,
              ],
            },
            e,
          ),
        ),
      }),
      (0, j.jsx)(`textarea`, {
        className: `mt-4 w-full rounded-xl border p-3`,
        rows: `4`,
        placeholder: r.notes,
        value: o,
        onChange: (e) => s(e.target.value),
      }),
      (0, j.jsx)(`p`, {
        className: `mt-3 text-xs text-slate-500`,
        children: r.feedbackNote,
      }),
      c &&
        (0, j.jsx)(`p`, {
          className: `mt-3 rounded-lg bg-green-50 p-2 text-sm text-green-800`,
          children: c,
        }),
      (0, j.jsxs)(`div`, {
        className: `mt-5 flex flex-wrap gap-2`,
        children: [
          mt,
          (0, j.jsx)(`button`, {
            onClick: d,
            className: `rounded-xl bg-slate-900 px-4 py-3 font-bold text-white`,
            children: r.saveReport,
          }),
          (0, j.jsx)(`button`, {
            onClick: f,
            className: `rounded-xl border px-4 py-3 font-bold`,
            children: r.copyReport,
          }),
        ],
      }),
    ],
  });
}
function Ft() {
  const learning=useLearning();
  const [levelSelected,setLevelSelected]=_.useState(false);
  const localTurnStart=_.useRef([]);
  const [guessCandidate,setGuessCandidate]=_.useState(null);
  const [pendingQuery,setPendingQuery]=_.useState(null);
  const busyRef=_.useRef(false);
  const [questionBusy,setQuestionBusy]=_.useState(false);
  const [privacy,setPrivacy]=_.useState(null);
  _.useEffect(()=>{if(!privacy)return;const cover=document.querySelector('.privacy-screen');if(!cover)return;const els=[...cover.parentElement.children].filter(el=>el!==cover);els.forEach(el=>{el.inert=true;el.setAttribute('aria-hidden','true');});cover.querySelector('button')?.focus();return()=>els.forEach(el=>{el.inert=false;el.removeAttribute('aria-hidden');});},[privacy]);
  let [e, t] = (0, _.useState)(`it`),
    n = gt[e],
    r = _t[e],
    [i, a] = (0, _.useState)(new URL(location.href).searchParams.has('room') ? 'online' : 'home'),
    [o, s] = (0, _.useState)({
      mode: `soloEasy`,
      audience: `adult`,
      level: `explorer`,
      assist: `assisted`,
      deckSize: 26,
    }),
    [c, l] = (0, _.useState)([]),
    [u, d] = (0, _.useState)(1),
    [f, p] = (0, _.useState)(null),
    [m, h] = (0, _.useState)(null),
    [g, v] = (0, _.useState)(1),
    [y, b] = (0, _.useState)(`ask`),
    [x, ee] = (0, _.useState)(``),
    [S, C] = (0, _.useState)(null),
    [te, ne] = (0, _.useState)({ 1: [], 2: [] }),
    [re, w] = (0, _.useState)({ 1: [], 2: [] }),
    [le, pe] = (0, _.useState)([]),
    [me, D] = (0, _.useState)([]),
    [O, k] = (0, _.useState)(``),
    [he, ge] = (0, _.useState)(null),
    [_e, ve] = (0, _.useState)(!1),
    [A, ye] = (0, _.useState)(null),
    [xe, Ce] = (0, _.useState)(``),
    [we, Ee] = (0, _.useState)(`all`),
    [Oe, ke] = (0, _.useState)(!1),
    [Ae, je] = (0, _.useState)({
      question: ``,
      answer: null,
      message: ``,
      config: { audience: `adult`, level: `base`, mode: `soloEasy` },
    }),
    [Me, Ne] = (0, _.useState)({ 1: 0, 2: 0, AI: 0 }),
    Pe = (0, _.useMemo)(() => {
      let e = tt();
      return { total: e.total, failed: e.failed.map((e) => e.question) };
    }, []),
    [Fe, Ie] = (0, _.useState)(null),
    [Le, Re] = (0, _.useState)(!1),
    [Be, Ve] = (0, _.useState)(``);
  _.useEffect(()=>{document.documentElement.lang=e;document.title=n.title+" · Michele Colucci";},[e]);
  async function He() {
    (Re(!0),
      Ve(
        e === `it`
          ? `Caricamento LLM locale nel browser…`
          : e === `fr`
            ? `Chargement du LLM local dans le navigateur…`
            : `Loading local browser LLM…`,
      ));
    try {
      (Ie(await ut({ modelId: ot, onProgress: (e) => Ve(e) })),
        Ve(
          e === `it`
            ? `LLM sperimentale attiva. Controlla sempre l’interpretazione proposta.`
            : e === `fr`
              ? `LLM expérimental actif. Vérifiez toujours l’interprétation proposée.`
              : `Experimental LLM active. Always check the proposed interpretation.`,
        ));
    } catch (t) {
      (Ie(null),
        Ve(
          `${e === `it` ? `LLM non disponibile; parser intelligente attivo` : e === `fr` ? `LLM indisponible ; parseur intelligent actif` : `LLM unavailable; smart parser active`}. ${t.message}`,
        ));
    } finally {
      Re(!1);
    }
  }
  async function Ue(t) {
    if (!Fe) return null;
    let n = await Fe.parse(t, e);
    return (
      n?.type === `parsed` &&
        Ve(formatQuery(n,e)),
      n
    );
  }
  function Ke(e) {
    D((t) => [e, ...t].slice(0, 10));
  }
  function Je(e = {}) {
    (je({
      question: e.question ?? S?.q ?? x,
      answer: e.answer ?? S?.answer ?? null,
      message: e.message ?? O,
      config: o,
    }),
      ke(!0));
  }
  function Ye() {
    setGuessCandidate(null);
    if(o.mode === 'online'){a('online');return;}
    setPendingQuery(null);setPrivacy(null);
    setLevelSelected(true);
    let e = selectDeck(be,o.deckSize,{profile:learning.engine.profile,mode:o.mode});
    learning.start({id:localId(),level:o.level,mode:o.mode,deckIds:e.map(c=>c.id)});
    (l(e),
      p(null),
      h(null),
      v(1),
      b(`ask`),
      ee(``),
      C(null),
      k(``),
      ge(null),
      ve(!1),
      D([]),
      ne({ 1: e.map((e) => e.id), 2: e.map((e) => e.id) }),
      w({ 1: [], 2: [] }),
      Ne({ 1: 0, 2: 0, AI: 0 }),
      pe(e.map((e) => e.id)),
      d(1),
      a(`pick`));
  }
  function Ze(e) {
    if (u === 1)
      if ((p(e), o.mode.startsWith(`solo`))) {
        let t = c;
        (h(t[Math.floor(Math.random() * t.length)]), a(`game`));
      } else {d(2);setPrivacy(2);}
    else {h(e); a(`game`); setPrivacy(1);}
  }
  function $e(e) {
    return c.filter((t) => te[e].includes(t.id) && !re[e].includes(t.id));
  }
  function et(t, n, r, i = null, spontaneous = false) {
    const description=describeQuestion({query:i,cards:$e(t),answer:r,level:o.level,language:e,
      automatic:o.assist==='assisted',spontaneous,actionId:localId()});
    learning.prepare(description,()=>{
      if(o.assist==='assisted') {
        ne(a=>({...a,[t]:a[t].filter(id=>!description.expectedIds.includes(id))}));
        learning.engine.automatic(description);
      }
    });
  }
  function nt() {
    let t = c.filter((e) => le.includes(e.id));
    if (t.length <= 1) {
      let n = t[0] || c[0];
      (C({
        kind: `computerGuess`,
        q: `${e === `it` ? `Il tuo radionuclide è` : e === `fr` ? `Votre radionucléide est` : `Is your radionuclide`} ${n.name[e]}?`,
        item: n,
      }),
        b(`computerAnswer`));
      return;
    }
    let n = Qe(t, o.mode === `soloEasy`, o.audience, legacyLevel(o.level), e);
    (C(
      n
        ? { kind: `computerQuestion`, q: n }
        : {
            kind: `computerGuess`,
            q: `${e === `it` ? `Il tuo radionuclide è` : e === `fr` ? `Votre radionucléide est` : `Is your radionuclide`} ${t[0].name[e]}?`,
            item: t[0],
          },
    ),
      b(`computerAnswer`));
  }
  async function rt(t = x, approved=null, spontaneous=true) {
    if(y!=="ask" || busyRef.current)return;
    busyRef.current=true;setQuestionBusy(true);
    try {
    let i = t.trim();
    if (!i) return;
    let a = o.mode.startsWith(`solo`) || g === 1 ? m : f,
      s = approved || ze(i, e),
      c = s?.type === `parsed` ? s : null,
      l = c ? Ge(a, c, e) : We(a, i, e),
      u = wt(o.level);
    if (Ct(c) && Number.isFinite(u) && (Me[dt] || 0) >= u) {
      k(r.timeLimitReached);
      return;
    }
    if (
      l.type === `unknown` &&
      Fe &&
      ((c = await Ue(i)),
      c && (l = Ge(a, c, e)),
      Ct(c) && Number.isFinite(u) && (Me[dt] || 0) >= u)
    ) {
      k(r.timeLimitReached);
      return;
    }
    if (l.type !== `ok`) {
      k(
        l.type === `invalid`
          ? n.questionInvalid
          : l.type === `unsupported`
            ? n.questionUnsupported
            : l.type === `clarify`
              ? l.reason === `inhalation_ambiguous`
                ? e === `it`
                  ? `Vuoi chiedere se è un gas, se può accumularsi in casa o se è rilevante per esposizione per inalazione?`
                  : e === `fr`
                    ? `Voulez-vous demander s’il s’agit d’un gaz, s’il peut s’accumuler dans une maison ou s’il est pertinent pour une exposition par inhalation ?`
                    : `Do you mean whether it is a gas, whether it can accumulate in homes, or whether it matters for inhalation exposure?`
                : e === `it`
                  ? `Questa domanda è ambigua: precisa la proprietà, il decadimento o il contesto.`
                  : e === `fr`
                    ? `Cette question est ambiguë : précisez la propriété, le mode de désintégration ou le contexte.`
                    : `This question is ambiguous: specify the property, decay mode or context.`
              : n.questionUnknown,
      );
      return;
    }
    if(!approved){setPendingQuery({text:i,query:c,spontaneous});return;}
    (Ct(c) &&
      Number.isFinite(u) &&
      Ne((e) => ({ ...e, [dt]: (e[dt] || 0) + 1 })),
      k(``),
      ee(``),
      o.mode.startsWith(`solo`)
        ? (et(1, i, l.yes, c, spontaneous),
          Ke({ who: 1, q: i, answer: l.yes }),
          C({
            kind: `shownAnswer`,
            q: i,
            answer: l.yes,
            explanation: l.explanation,
            next: `computer`,
            structuredFilter: c,
          }),
          b(`showAnswer`))
        : (C({
            kind: `localQuestion`,
            q: i,
            evaluated: l,
            structuredFilter: c,
          }),
          setPrivacy(g===1?2:1), b(`localAnswer`)));
    } catch(err){k(n.questionUnknown);} finally{busyRef.current=false;setQuestionBusy(false);}
  }
  function it(t) {
    let r = g === 1 ? m : f,
      i = S.structuredFilter ? Ge(r, S.structuredFilter, e) : We(r, S.q, e);
    if (i.yes !== t) {
      k(n.inconsistent);
      return;
    }
    (k(``),
      et(g, S.q, t, S.structuredFilter),
      Ke({ who: g, q: S.q, answer: t, explanation: i.explanation }),
      C({
        kind: `shownAnswer`,
        q: S.q,
        answer: t,
        explanation: i.explanation,
        next: `switch`,
      }),
      setPrivacy(g), b(`showAnswer`));
  }
  function at() {
    const advance=()=>{
      let next=S?.next;
      C(null);k('');
      if(next==='computer')nt();
      else {setPrivacy(g===1?2:1);v(value=>value===1?2:1);b('ask');}
    };
    if(o.mode==='local') {
      const before=localTurnStart.current;
      learning.verbal(before,before.filter(id=>!$e(dt).some(c=>c.id===id)),`player${g}`);
      advance();
    } else {
      const d=learning.current;
      learning.review(d?.candidateIds.filter(id=>!$e(dt).some(c=>c.id===id))||[],advance);
    }
  }
  function st(t) {
    if (S.kind === `computerGuess`) {
      let e = S.item.id === f.id;
      if (t !== e) {
        k(n.inconsistent);
        return;
      }
      (Ke({ who: `AI`, q: S.q, answer: t }),
        e
          ? (ge(`AI`), b(`end`))
          : (pe((e) => e.filter((e) => e !== S.item.id)), C(null), b(`ask`)));
      return;
    }
    let r = We(f, S.q, e);
    if (t !== r.yes) {
      k(n.inconsistent);
      return;
    }
    (k(``),
      pe((n) =>
        n.filter(
          (n) =>
            We(
              c.find((e) => e.id === n),
              S.q,
              e,
            ).yes === t,
        ),
      ),
      Ke({ who: `AI`, q: S.q, answer: t, explanation: r.explanation }),
      C(null),
      b(`ask`));
  }
  function ct(t) {
    if(y!=="ask")return;
    learning.engine.emit("GUESS_MADE",localId(),{cardId:t.id},`player${g}`);
    let r = o.mode.startsWith(`solo`) || g === 1 ? m : f,
      i = t.id === r.id;
    if ((Ke({ who: g, q: `${n.guess}: ${t.name[e]}`, answer: i }), ve(!1), i)) {
      (ge(g), b(`end`));
      return;
    }
    (k(n.wrongGuess),
      o.mode.startsWith(`solo`) ? nt() : (setPrivacy(g===1?2:1),v((e) => (e === 1 ? 2 : 1))));
  }
  function lt(e) {
    if(learning.active)return;
    !(o.mode === 'local' && y === 'ask' || o.assist === 'manual' && y === 'showAnswer') ||
      w((t) => ({
        ...t,
        [dt]: t[dt].includes(e) ? t[dt].filter((t) => t !== e) : [...t[dt], e],
      }));
  }
  let dt = o.mode.startsWith(`solo`) ? 1 : g,
    mt = o.mode.startsWith(`solo`) ? f : y === "localAnswer" ? (g === 1 ? m : f) : (g === 1 ? f : m),
    ht = g === 1 ? 2 : 1,
    vt = o.mode.startsWith(`solo`) ? le.length : $e(ht).length,
    yt = be.filter((t) => {
      let n = De(xe),
        r = De(
          `${t.id} ${t.name[e]} ${t.story[e]} ${bt(t, e)} ${t.concepts.map((t) => Te[t]?.label?.[e] || t).join(` `)}`,
        ).includes(n);
      return (!n || r) && (we === `all` || t.tags.includes(we));
    });
  _.useEffect(()=>{if(i==='game'&&y==='end')learning.finish(he==='AI'?'lost':'won');},[i,y,he]);
  _.useEffect(()=>{if(o.mode==='local'&&y==='ask')localTurnStart.current=$e(dt).map(c=>c.id);},[g,y,i]);
  return (0, j.jsxs)(`div`, {
    className: `min-h-screen bg-[#fffdf8] text-slate-900`,
    children: [
      (0, j.jsxs)(`header`, {
        className: `sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur`,
        children: [
          (0, j.jsxs)(`button`, {
            onClick: () => a(`home`),
            className: `flex items-center gap-3`,
            children: [
              (0, j.jsx)(ie, { className: `h-7 w-7 text-[#ff704e]` }),
              (0, j.jsx)(`span`, {
                className: `hidden font-bold sm:block`,
                children: n.title,
              }),
            ],
          }),
          (0, j.jsxs)(`div`, {
            className: `flex items-center gap-2`,
            children: [
              (0, j.jsx)(oe, { className: `h-4 w-4 text-slate-500` }),
              [`it`, `en`, `fr`].map((n) =>
                (0, j.jsx)(
                  `button`,
                  {
                    onClick: () => {setPendingQuery(null);t(n);},
                    disabled: questionBusy || i==="game" && y!=="ask",
                    "aria-label": ({it:"Italiano",en:"English",fr:"Français"})[n],
                    className: `rounded-lg px-2 py-1 text-xs font-bold uppercase ${e === n ? `bg-slate-900 text-white` : `bg-slate-100`}`,
                    children: n,
                  },
                  n,
                ),
              ),
            ],
          }),
        ],
      }),
      i === `home` &&
        (0, j.jsx)(`main`, {
          className: `mx-auto max-w-6xl px-5 py-10`,
          children: (0, j.jsxs)(`div`, {
            className: `grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]`,
            children: [
              (0, j.jsxs)(`section`, {
                children: [
                  (0, j.jsx)(M, {}),
                  (0, j.jsx)(`p`, {
                    className: `mt-6 text-xl text-slate-600`,
                    children: n.subtitle,
                  }),
                  (0, j.jsxs)(`p`, {
                    className: `mt-5 text-slate-600`,
                    children: [
                      be.length,
                      ` radionuclidi, più livelli di gioco e domande narrative o fisiche.`,
                    ],
                  }),
                  (0, j.jsxs)(`div`, {
                    className: `mt-8 flex flex-wrap gap-3`,
                    children: [
                      (0, j.jsxs)(`button`, {
                        onClick: () => a(`setup`),
                        className: `flex gap-2 rounded-2xl bg-slate-900 px-7 py-4 font-bold text-white`,
                        children: [(0, j.jsx)(ce, {}), ` `, n.play],
                      }),
                      (0, j.jsxs)(`button`, {
                        onClick: () => a(`learn`),
                        className: `flex gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-7 py-4 font-bold`,
                        children: [(0, j.jsx)(T, {}), ` `, r.learnFirst],
                      }),
                      (0, j.jsxs)(`button`, {
                        onClick: () => a(`atlas`),
                        className: `flex gap-2 rounded-2xl border bg-white px-7 py-4 font-bold`,
                        children: [(0, j.jsx)(ae, {}), ` `, n.atlas],
                      }),
                      (0, j.jsxs)(`button`, {
                        onClick: () => a(`about`),
                        className: `flex gap-2 rounded-2xl border bg-white px-7 py-4 font-bold`,
                        children: [(0, j.jsx)(se, {}), ` `, n.about],
                      }),
                    ],
                  }),
                  (0, j.jsxs)(`p`, {
                    className: `mt-10 text-sm text-slate-500`,
                    children: [
                      n.credits,
                      ` `,
                      (0, j.jsx)(`a`, {
                        className: `underline`,
                        href: ft,
                        target: `_blank`,
                        rel: `noreferrer`,
                        children: `DOI: 10.15161/oar.it/77027`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, j.jsx)(`div`, {
                className: `grid grid-cols-3 gap-3`,
                children: Xe(9).map((t) =>
                  (0, j.jsx)(kt, { item: t, lang: e, compact: !0 }, t.id),
                ),
              }),
            ],
          }),
        }),
      i === `learn` &&
        (0, j.jsx)(TutorialEntry, {
          lang: e,
          level: levelSelected ? o.level : null,
          cards: be,
          deck: c,
          setLevel: (e) => {setLevelSelected(true);s(normalConfig({ ...o, level: e }));},
          close: () => a(`home`),
          start: () => a(`setup`),
        }),
      i === `setup` &&
        (0, j.jsxs)(`main`, {
          className: `mx-auto max-w-4xl px-5 py-8`,
          children: [
            (0, j.jsx)(`h1`, {
              className: `text-3xl font-bold`,
              children: n.setup,
            }),
            (0, j.jsx)(jt, {
              title: n.mode,
              children: [
                [`soloEasy`, n.soloEasy],
                [`soloHard`, n.soloHard],
                [`local`, n.local],
                ['online', multiplayerText[e].online],
              ].map(([e, t]) =>
                (0, j.jsx)(
                  Et,
                  {
                    active: o.mode === e,
                    onClick: () => s({ ...o, mode: e }),
                    children: t,
                  },
                  e,
                ),
              ),
            }),
            j.jsx(jt, {
              title: learningText[e].level,
              children: LEVELS.map(level => j.jsxs('button', {
                'data-learning-level': level,
                onClick: () => {setLevelSelected(true);s(normalConfig({...o, level}));},
                className: `min-w-[190px] rounded-2xl border p-4 text-left transition ${o.level === level ? 'border-slate-900 bg-slate-900 text-white' : 'bg-white hover:border-slate-400'}`,
                children: [j.jsx('b', {children: learningText[e][level]}),
                  j.jsx('span', {className:'mt-1 block text-xs', children:learningText[e][level+'Hint']})],
              }, level)),
            }),
            (0, j.jsx)(jt, {
              title: n.deck,
              children: [12, 18, 26, be.length].map((e) =>
                (0, j.jsx)(
                  Et,
                  {
                    active: o.deckSize === e,
                    onClick: () => s({ ...o, deckSize: e }),
                    children: e === be.length ? n.full : e,
                  },
                  e,
                ),
              ),
            }),
            o.mode.startsWith(`solo`) &&
              (0, j.jsx)(`p`, {
                className: `mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900`,
                children: n.aiFair,
              }),
            (0, j.jsx)(`button`, {
              onClick: Ye,
              className: `mt-8 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white`,
              children: n.start,
            }),
          ],
        }),
      i === 'online' && j.jsx(OnlineGame,{lang:e,config:o,Card:kt,Modal:At,showDetail:ye,onBack:()=>a('home')}),
      i === `pick` &&
        (0, j.jsxs)(`main`, {
          className: `mx-auto max-w-6xl px-5 py-8`,
          children: [
            (0, j.jsx)(`h1`, {
              className: `mb-2 text-3xl font-bold`,
              children: o.mode.startsWith(`solo`)
                ? n.pickSolo
                : u === 1
                  ? n.pick1
                  : n.pick2,
            }),
            u === 2 &&
              (0, j.jsx)(`p`, {
                className: `mb-6 font-medium text-orange-700`,
                children: n.hide,
              }),
            (0, j.jsx)(`div`, {
              className: `grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5`,
              children: c.map((t) =>
                (0, j.jsx)(
                  kt,
                  { item: t, lang: e, compact: !0, onClick: () => Ze(t) },
                  t.id,
                ),
              ),
            }),
          ],
        }),
      i === `game` &&
        (0, j.jsx)(`main`, {
          className: `mx-auto max-w-7xl px-4 py-6`,
          children:
            y === `end`
              ? (0, j.jsx)(It, {
                  t: n,
                  lang: e,
                  winner: he,
                  p1: f,
                  p2: m,
                  showDetail: ye,
                  restart: () => a(`setup`),
                })
              : (0, j.jsxs)(j.Fragment, {
                  children: [
                    (0, j.jsxs)(`div`, {
                      className: `mb-5 flex flex-wrap items-center justify-between gap-3`,
                      children: [
                        (0, j.jsxs)(`h1`, {
                          className: `text-2xl font-bold`,
                          children: [
                            n.turn,
                            `: `,
                            o.mode.startsWith(`solo`)
                              ? y === `computerAnswer`
                                ? n.computer
                                : n.player
                              : `${n.player} ${g}`,
                          ],
                        }),
                        (0, j.jsxs)(`div`, {
                          className: `flex flex-wrap gap-2`,
                          children: [
                            (0, j.jsxs)(`div`, {
                              className: `rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white`,
                              children: [$e(dt).length, ` `, n.candidates],
                            }),
                            (0, j.jsxs)(`div`, {
                              className: `rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-950`,
                              children: [
                                n.opponentCount,
                                ` `,
                                vt,
                                ` `,
                                n.candidates,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, j.jsxs)(`div`, {
                      className: `grid gap-6 lg:grid-cols-[390px_1fr]`,
                      children: [
                        (0, j.jsxs)(`aside`, {
                          className: `h-fit rounded-3xl border bg-white p-5`,
                          children: [
                            j.jsx(LearningPanel,{learning,lang:e}),
                            mt &&
                              (0, j.jsxs)(`div`, {
                                className: `mb-5 rounded-2xl bg-slate-50 p-3`,
                                children: [
                                  (0, j.jsxs)(`div`, {
                                    className: `mb-2 text-sm font-bold`,
                                    children: [n.secret, `: `, mt.name[e]],
                                  }),
                                  (0, j.jsxs)(`button`, {
                                    onClick: () => {learning.markAssisted();ye(mt);},
                                    className: `flex w-full justify-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold`,
                                    children: [
                                      (0, j.jsx)(se, { className: `h-4 w-4` }),
                                      n.openMine,
                                    ],
                                  }),
                                ],
                              }),
                            o.mode === 'local' && y === 'ask' && j.jsxs(j.Fragment,{children:[
                              j.jsx('p',{className:'mb-3 rounded-xl bg-blue-50 p-3',children:multiplayerText[e].localHint}),
                              j.jsx('button',{className:'mt-2 w-full rounded-xl bg-slate-900 py-3 font-bold text-white',onClick:()=>{if(privacy)return;ve(false);setGuessCandidate(null);at();},children:multiplayerText[e].endTurn}),
                              j.jsx('button',{className:'mt-2 w-full rounded-xl border py-3 font-bold',onClick:()=>ve(!_e),children:_e?multiplayerText[e].cancel:n.guess}),
                            ]}),
                            o.mode !== 'local' && y === `ask` &&
                              (0, j.jsxs)(j.Fragment, {
                                children: [
                                  (0, j.jsx)(`h2`, {
                                    className: `mb-3 font-bold`,
                                    children: n.typeQuestion,
                                  }),
                                  (0, j.jsxs)(`p`, {
                                    className: `mb-3 rounded-xl bg-orange-50 p-3 text-xs text-orange-950`,
                                    children: [
                                      (0, j.jsxs)(`b`, {
                                        children: [
                                          n.opponentCount,
                                          ` `,
                                          vt,
                                          ` `,
                                          n.candidates,
                                          `.`,
                                        ],
                                      }),
                                      ` `,
                                      n.opponentCountHint,
                                    ],
                                  }),
                                  (0, j.jsx)(`textarea`, {
                                    value: x,
                                    "aria-label": n.typeQuestion,
                                    maxLength: 400,
                                    onChange: (e) => ee(e.target.value),
                                    placeholder: n.placeholder,
                                    className: `h-24 w-full rounded-xl border p-3 text-sm`,
                                  }),
                                  (0, j.jsx)(`p`, {
                                    className: `mt-2 text-xs text-slate-500`,
                                    children: n.timeHint,
                                  }),
                                  Number.isFinite(wt(o.level)) &&
                                    (0, j.jsxs)(`p`, {
                                      className: `mt-2 rounded-xl bg-amber-50 p-2 text-xs font-semibold text-amber-900`,
                                      children: [
                                        r.timeLimit,
                                        `: `,
                                        Me[dt] || 0,
                                        `/`,
                                        wt(o.level),
                                        ` · `,
                                        r.timeLimitHint,
                                      ],
                                    }),
                                  (0, j.jsx)(`div`, {
                                    className: `mt-3 rounded-xl border bg-slate-50 p-3 text-xs text-slate-600`,
                                    children: (0, j.jsxs)(`div`, {
                                      className: `flex items-center justify-between gap-2`,
                                      children: [
                                        (0, j.jsx)(`span`, {
                                          children:
                                            Be || (!MODEL_AVAILABLE ? ({it:"Interprete offline attivo. Il modello sperimentale non è installato.",en:"Offline interpreter active. The experimental model is not installed.",fr:"Interpréteur hors ligne actif. Le modèle expérimental n’est pas installé."})[e] : null) ||
                                            ({it:"Domande offline già attive. LLM sperimentale: download iniziale, WebGPU e circa 1,1 GB di memoria GPU.",en:"Offline questions are ready. Experimental LLM: initial download, WebGPU and about 1.1 GB GPU memory.",fr:"Questions hors ligne actives. LLM expérimental : téléchargement initial, WebGPU et environ 1,1 Go de mémoire GPU."})[e],
                                        }),
                                        (0, j.jsx)(`button`, {
                                          onClick: He,
                                          disabled: !MODEL_AVAILABLE || Le || !!Fe,
                                          className: `rounded-lg bg-slate-900 px-3 py-2 font-bold text-white disabled:opacity-50`,
                                          children: !MODEL_AVAILABLE ? ({it:"LLM non installata",en:"LLM not installed",fr:"LLM non installé"})[e] : Fe
                                            ? ({it:"LLM attiva",en:"LLM ready",fr:"LLM actif"})[e]
                                            : Le
                                              ? ({it:"Carico…",en:"Loading…",fr:"Chargement…"})[e]
                                              : ({it:"Scarica LLM (~350 MB)",en:"Download LLM (~350 MB)",fr:"Télécharger LLM (~350 Mo)"})[e],
                                        }),
                                      ],
                                    }),
                                  }),
                                  (0, j.jsx)(`button`, {
                                    onClick: () => rt(),
                                    disabled: questionBusy,
                                    className: `mt-2 w-full rounded-xl bg-slate-900 py-3 font-bold text-white`,
                                    children: n.submit,
                                  }),
                                  (0, j.jsx)(`button`, {
                                    onClick: () => ve(!0),
                                    className: `mt-2 w-full rounded-xl border py-3 font-bold`,
                                    children: n.guess,
                                  }),
                                  (0, j.jsx)(`h3`, {
                                    className: `mb-2 mt-5 text-sm font-bold`,
                                    children: n.quick,
                                  }),
                                  (0, j.jsx)(`div`, {
                                    className: `flex flex-wrap gap-2`,
                                    children: qe(o.audience, legacyLevel(o.level), e).map(
                                      (e) =>
                                        (0, j.jsx)(
                                          `button`,
                                          {
                                            onClick: () => rt(e,null,false),
                                            disabled: questionBusy,
                                            className: `rounded-lg bg-slate-100 px-3 py-2 text-left text-xs`,
                                            children: e,
                                          },
                                          e,
                                        ),
                                    ),
                                  }),
                                ],
                              }),
                            y === `showAnswer` &&
                              (0, j.jsxs)(j.Fragment, {
                                children: [
                                  (0, j.jsxs)(`div`, {
                                    className: `rounded-3xl border-2 p-6 text-center ${S.answer ? `border-green-500 bg-green-50` : `border-red-500 bg-red-50`}`,
                                    children: [
                                      (0, j.jsx)(`p`, {
                                        className: `text-sm font-bold uppercase tracking-widest text-slate-500`,
                                        children: n.answer,
                                      }),
                                      (0, j.jsx)(`p`, {
                                        className: `mt-2 text-6xl font-black ${S.answer ? `text-green-700` : `text-red-700`}`,
                                        children: S.answer ? n.yes : n.no,
                                      }),
                                      (0, j.jsx)(`p`, {
                                        className: `mt-3 text-sm font-medium`,
                                        children: S.q,
                                      }),
                                    ],
                                  }),
                                  (0, j.jsx)(`p`, {
                                    className: `mt-4 text-sm font-medium text-slate-600`,
                                    children:
                                      o.assist === `manual`
                                        ? n.answerInstruction
                                        : learning.active ? learningText[e].predictHint : n.automaticInstruction,
                                  }),
                                  (0, j.jsxs)(`div`, {
                                    className: `mt-4 flex flex-col gap-2`,
                                    children: [
                                      (0, j.jsx)(`button`, {
                                        onClick: at,
                                        disabled: learning.active,
                                        className: `w-full rounded-xl bg-slate-900 py-3 font-bold text-white`,
                                        children: n.nextTurn,
                                      }),
                                      (0, j.jsx)(`button`, {
                                        onClick: () =>
                                          Je({
                                            question: S.q,
                                            answer: S.answer,
                                          }),
                                        className: `w-full rounded-xl border py-3 text-sm font-bold`,
                                        children: r.report,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            y === `localAnswer` &&
                              (0, j.jsxs)(j.Fragment, {
                                children: [
                                  (0, j.jsx)(`h2`, {
                                    className: `font-bold`,
                                    children: n.respond,
                                  }),
                                  (0, j.jsx)(`p`, {
                                    className: `mt-2 text-xs text-slate-500`,
                                    children: n.pass,
                                  }),
                                  (0, j.jsx)(`p`, {
                                    className: `my-4 rounded-xl bg-blue-50 p-4 font-medium`,
                                    children: S.q,
                                  }),
                                  (0, j.jsxs)(`div`, {
                                    className: `flex gap-2`,
                                    children: [
                                      (0, j.jsx)(`button`, {
                                        onClick: () => it(!0),
                                        className: `flex-1 rounded-xl bg-green-600 py-3 font-bold text-white`,
                                        children: n.yes,
                                      }),
                                      (0, j.jsx)(`button`, {
                                        onClick: () => it(!1),
                                        className: `flex-1 rounded-xl bg-red-600 py-3 font-bold text-white`,
                                        children: n.no,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            y === `computerAnswer` &&
                              (0, j.jsxs)(j.Fragment, {
                                children: [
                                  (0, j.jsx)(`h2`, {
                                    className: `font-bold`,
                                    children: n.computerAsks,
                                  }),
                                  (0, j.jsx)(`p`, {
                                    className: `my-4 rounded-xl bg-blue-50 p-4 font-medium`,
                                    children: S.q,
                                  }),
                                  (0, j.jsxs)(`div`, {
                                    className: `flex gap-2`,
                                    children: [
                                      (0, j.jsx)(`button`, {
                                        onClick: () => st(!0),
                                        className: `flex-1 rounded-xl bg-green-600 py-3 font-bold text-white`,
                                        children: n.yes,
                                      }),
                                      (0, j.jsx)(`button`, {
                                        onClick: () => st(!1),
                                        className: `flex-1 rounded-xl bg-red-600 py-3 font-bold text-white`,
                                        children: n.no,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            O &&
                              (0, j.jsxs)(j.Fragment, {
                                children: [
                                  (0, j.jsx)(`p`, {
                                    className: `mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900`,
                                    children: O,
                                  }),
                                  (0, j.jsx)(`button`, {
                                    onClick: () => Je({ message: O }),
                                    className: `mt-2 text-xs font-semibold underline`,
                                    children: r.report,
                                  }),
                                ],
                              }),
                            me.length > 0 &&
                              (0, j.jsxs)(`div`, {
                                className: `mt-6 border-t pt-4`,
                                children: [
                                  (0, j.jsx)(`h3`, {
                                    className: `mb-2 text-sm font-bold`,
                                    children: `Log`,
                                  }),
                                  me
                                    .slice(0, 4)
                                    .map((e, t) =>
                                      (0, j.jsxs)(
                                        `div`,
                                        {
                                          className: `mb-2 text-xs`,
                                          children: [
                                            (0, j.jsxs)(`b`, {
                                              children: [
                                                e.who === `AI`
                                                  ? n.computer
                                                  : `${n.player} ${e.who}`,
                                                `:`,
                                              ],
                                            }),
                                            ` `,
                                            e.q,
                                            ` `,
                                            (0, j.jsx)(`span`, {
                                              className: e.answer
                                                ? `text-green-700`
                                                : `text-red-700`,
                                              children: e.answer ? n.yes : n.no,
                                            }),
                                            e.explanation &&
                                              (0, j.jsx)(`p`, {
                                                className: `mt-1 text-slate-500`,
                                                children: e.explanation,
                                              }),
                                          ],
                                        },
                                        t,
                                      ),
                                    ),
                                ],
                              }),
                          ],
                        }),
                        (0, j.jsxs)(`section`, {
                          children: [
                            (0, j.jsx)(`p`, {
                              className: `mb-3 text-sm text-slate-500`,
                              children:
                                o.assist === `manual`
                                  ? n.answerInstruction
                                  : learning.active ? learningText[e].predictHint : n.automaticInstruction,
                            }),
                            (0, j.jsx)(`div`, {
                              className: `grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4`,
                              children: c.map((t) =>
                                (0, j.jsx)(
                                  kt,
                                  {
                                    item: t,
                                    lang: e,
                                    compact: !0,
                                    inactive:
                                      !te[dt].includes(t.id) ||
                                      re[dt].includes(t.id),
                                    onClick: () => (_e ? (o.mode === 'local' ? setGuessCandidate(t) : ct(t)) : (learning.markAssisted(),ye(t))),
                                    lens:learning.lens&&learning.current?propertyText(t,learning.current.query,e):null,
                                    action:
                                      !_e &&
                                      (o.mode === 'local' && y === 'ask' || o.assist === 'manual' && y === 'showAnswer') &&
                                      te[dt].includes(t.id)
                                        ? {
                                            label: re[dt].includes(t.id)
                                              ? e === `it`
                                                ? `Ripristina carta`
                                                : e === `fr`
                                                  ? `Restaurer la carte`
                                                  : `Restore card`
                                              : e === `it`
                                                ? `Escludi carta`
                                                : e === `fr`
                                                  ? `Éliminer la carte`
                                                  : `Eliminate card`,
                                            onClick: () => lt(t.id),
                                          }
                                        : null,
                                  },
                                  t.id,
                                ),
                              ),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
        }),
      i === 'game' && y === 'end' && j.jsx(LearningRecap,{learning,lang:e}),
      i === `atlas` &&
        (0, j.jsxs)(`main`, {
          className: `mx-auto max-w-7xl px-5 py-8`,
          children: [
            (0, j.jsxs)(`div`, {
              className: `flex flex-wrap items-end justify-between gap-4`,
              children: [
                (0, j.jsxs)(`div`, {
                  children: [
                    (0, j.jsx)(`h1`, {
                      className: `text-3xl font-bold`,
                      children: n.atlas,
                    }),
                    (0, j.jsxs)(`p`, {
                      className: `mt-2 text-slate-500`,
                      children: [be.length, ` radionuclidi`],
                    }),
                  ],
                }),
                (0, j.jsxs)(`div`, {
                  className: `relative`,
                  children: [
                    (0, j.jsx)(ue, {
                      className: `absolute left-3 top-3 h-4 w-4 text-slate-400`,
                    }),
                    (0, j.jsx)(`input`, {
                      value: xe,
                      onChange: (e) => Ce(e.target.value),
                      placeholder: n.search,
                      className: `w-72 rounded-xl border py-2.5 pl-9 pr-4`,
                    }),
                  ],
                }),
              ],
            }),
            (0, j.jsx)(`div`, {
              className: `mb-6 mt-6 flex flex-wrap gap-2`,
              children: [
                [`all`, n.all],
                [`medical`, n.medical],
                [`natural`, n.natural],
                [`cosmogenic`, n.cosmos],
                [`fission`, n.fission],
                [`environment`, n.environment],
                [`industry`, n.industry],
              ].map(([e, t]) =>
                (0, j.jsx)(
                  Et,
                  { active: we === e, onClick: () => Ee(e), children: t },
                  e,
                ),
              ),
            }),
            (0, j.jsx)(`div`, {
              className: `grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5`,
              children: yt.map((t) =>
                (0, j.jsx)(
                  kt,
                  { item: t, lang: e, onClick: () => ye(t) },
                  t.id,
                ),
              ),
            }),
          ],
        }),
      i === `about` &&
        (0, j.jsxs)(`main`, {
          className: `mx-auto max-w-3xl px-5 py-10`,
          children: [
            (0, j.jsx)(M, { compact: !0 }),
            (0, j.jsx)(`h1`, {
              className: `mt-10 text-3xl font-bold`,
              children: n.about,
            }),
            (0, j.jsxs)(`div`, {
              className: `mt-6 rounded-2xl border bg-white p-6 text-center`,
              children: [
                (0, j.jsx)(`img`, {
                  src: `./logos/radiolab-infn.png`,
                  alt: `RadioLAB — INFN`,
                  className: `mx-auto max-h-24 max-w-full object-contain`,
                }),
                (0, j.jsx)(`p`, {
                  className: `mt-5 text-slate-700`,
                  children: n.credits,
                }),
                (0, j.jsxs)(`div`, {
                  className: `mt-5 flex flex-wrap justify-center gap-3`,
                  children: [
                    (0, j.jsx)(`a`, {
                      href: `https://web.infn.it/RadioLAB/`,
                      target: `_blank`,
                      rel: `noreferrer`,
                      className: `rounded-xl border px-4 py-2 text-sm font-bold`,
                      children: r.radiolab,
                    }),
                    (0, j.jsx)(`a`, {
                      href: ft,
                      target: `_blank`,
                      rel: `noreferrer`,
                      className: `rounded-xl border px-4 py-2 text-sm font-bold`,
                      children: r.originalRepo,
                    }),
                  ],
                }),
              ],
            }),
            (0, j.jsx)(`p`, {
              className: `mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900`,
              children: n.dataNote,
            }),
            (0, j.jsxs)(`div`, {
              className: `mt-4 rounded-xl p-4 text-sm ${Pe.failed.length ? `bg-red-50 text-red-900` : `bg-green-50 text-green-900`}`,
              children: [
                (0, j.jsxs)(`b`, { children: [n.tests, `:`] }),
                ` `,
                Pe.total - Pe.failed.length,
                `/`,
                Pe.total,
                ` `,
                Pe.failed.length ? n.testFail : n.testOk,
                Pe.failed.length > 0 &&
                  (0, j.jsx)(`div`, {
                    className: `mt-2`,
                    children: Pe.failed.join(`, `),
                  }),
              ],
            }),
            (0, j.jsx)(`h2`, {
              className: `mt-8 text-xl font-bold`,
              children: n.sourceStatus,
            }),
            (0, j.jsx)(`div`, {
              className: `mt-4 space-y-3`,
              children: pt.map((e) =>
                (0, j.jsx)(
                  `a`,
                  {
                    target: `_blank`,
                    rel: `noreferrer`,
                    href: e.url,
                    className: `block rounded-xl border bg-white p-4 font-medium hover:border-slate-500`,
                    children: e.label,
                  },
                  e.url,
                ),
              ),
            }),
          ],
        }),
      A &&
        (0, j.jsxs)(At, {
          close: () => ye(null),
          children: [
            (0, j.jsxs)(`div`, {
              className: `flex justify-between gap-3`,
              children: [
                (0, j.jsxs)(`div`, {
                  children: [
                    (0, j.jsx)(`h2`, {
                      className: `text-3xl font-bold`,
                      children: A.name[e],
                    }),
                    (0, j.jsxs)(`p`, {
                      className: `mt-1 text-sm font-semibold text-slate-500`,
                      children: [A.id, ` · `, bt(A, e)],
                    }),
                  ],
                }),
                (0, j.jsx)(`button`, {
                  onClick: () => ye(null),
                  children: (0, j.jsx)(E, {}),
                }),
              ],
            }),
            (0, j.jsx)(`div`, {
              className: `mt-3 text-lg font-semibold text-slate-600`,
              children: Se(A.seconds, e),
            }),
            j.jsx(EvidencePanel,{card:A,lang:e}),
            (0, j.jsx)(`div`, {
              className: `my-4 flex flex-wrap gap-2`,
              children: A.modes.map((e) =>
                (0, j.jsx)(
                  `span`,
                  {
                    className: `rounded-lg border px-3 py-2 font-bold`,
                    style: { background: de[e] || `white` },
                    children: fe[e],
                  },
                  e,
                ),
              ),
            }),
            o.audience === `child` &&
              (0, j.jsxs)(`div`, {
                className: `mb-4 rounded-2xl bg-amber-50 p-4 text-sm`,
                children: [
                  (0, j.jsx)(`b`, { children: r.colorLegend }),
                  (0, j.jsxs)(`div`, {
                    className: `mt-2 flex flex-wrap gap-2`,
                    children: [
                      (0, j.jsx)(`span`, {
                        className: `rounded px-2 py-1`,
                        style: { background: de.alpha },
                        children: `Giallo · α`,
                      }),
                      (0, j.jsx)(`span`, {
                        className: `rounded px-2 py-1`,
                        style: { background: de[`beta-`] },
                        children: `Azzurro · β⁻`,
                      }),
                      (0, j.jsx)(`span`, {
                        className: `rounded px-2 py-1`,
                        style: { background: de[`beta+`] },
                        children: `Arancione · β⁺/ε`,
                      }),
                    ],
                  }),
                ],
              }),
            ((o.audience === `adult` && legacyLevel(o.level) !== `base`) ||
              (o.audience === `child` && legacyLevel(o.level) === `expert`)) &&
              (0, j.jsxs)(`dl`, {
                className: `grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-center`,
                children: [
                  (0, j.jsxs)(`div`, {
                    children: [
                      (0, j.jsx)(`dt`, {
                        className: `text-xs text-slate-500`,
                        children: `Z`,
                      }),
                      (0, j.jsx)(`dd`, {
                        className: `font-bold`,
                        children: A.Z,
                      }),
                    ],
                  }),
                  (0, j.jsxs)(`div`, {
                    children: [
                      (0, j.jsx)(`dt`, {
                        className: `text-xs text-slate-500`,
                        children: n.mass,
                      }),
                      (0, j.jsx)(`dd`, {
                        className: `font-bold`,
                        children: A.A,
                      }),
                    ],
                  }),
                  (0, j.jsxs)(`div`, {
                    children: [
                      (0, j.jsx)(`dt`, {
                        className: `text-xs text-slate-500`,
                        children: n.neutrons,
                      }),
                      (0, j.jsx)(`dd`, {
                        className: `font-bold`,
                        children: A.A - A.Z,
                      }),
                    ],
                  }),
                ],
              }),
            (0, j.jsxs)(`h3`, {
              className: `mt-6 flex gap-2 font-bold`,
              children: [
                (0, j.jsx)(T, { className: `h-5 w-5 text-amber-500` }),
                n.didYouKnow,
              ],
            }),
            (0, j.jsx)(`p`, {
              className: `mt-2 text-slate-700`,
              children: A.story[e],
            }),
            ((o.audience === `adult` && legacyLevel(o.level) !== `base`) ||
              (o.audience === `child` && legacyLevel(o.level) === `expert`)) &&
              (0, j.jsxs)(j.Fragment, {
                children: [
                  (0, j.jsx)(`h3`, {
                    className: `mt-6 font-bold`,
                    children:
                      e === `it`
                        ? `Chimica dell’elemento`
                        : e === `fr`
                          ? `Chimie de l’élément`
                          : `Element chemistry`,
                  }),
                  (0, j.jsxs)(`dl`, {
                    className: `mt-2 grid grid-cols-2 gap-3 rounded-2xl bg-blue-50 p-4 text-sm`,
                    children: [
                      (0, j.jsxs)(`div`, {
                        children: [
                          (0, j.jsx)(`dt`, {
                            className: `text-slate-500`,
                            children:
                              e === `it`
                                ? `Famiglia`
                                : e === `fr`
                                  ? `Famille`
                                  : `Family`,
                          }),
                          (0, j.jsx)(`dd`, {
                            className: `font-bold`,
                            children: bt(A, e),
                          }),
                        ],
                      }),
                      (0, j.jsxs)(`div`, {
                        children: [
                          (0, j.jsx)(`dt`, {
                            className: `text-slate-500`,
                            children:
                              e === `it`
                                ? `Stato`
                                : e === `fr`
                                  ? `État`
                                  : `State`,
                          }),
                          (0, j.jsx)(`dd`, {
                            className: `font-bold`,
                            children: xt(A, e),
                          }),
                        ],
                      }),
                      (0, j.jsxs)(`div`, {
                        children: [
                          (0, j.jsx)(`dt`, {
                            className: `text-slate-500`,
                            children:
                              e === `it`
                                ? `Gruppo / periodo`
                                : e === `fr`
                                  ? `Groupe / période`
                                  : `Group / period`,
                          }),
                          (0, j.jsxs)(`dd`, {
                            className: `font-bold`,
                            children: [
                              A.element.group ?? `—`,
                              ` / `,
                              A.element.period,
                            ],
                          }),
                        ],
                      }),
                      (0, j.jsxs)(`div`, {
                        children: [
                          (0, j.jsx)(`dt`, {
                            className: `text-slate-500`,
                            children:
                              e === `it`
                                ? `Fusione elemento`
                                : e === `fr`
                                  ? `Fusion de l’élément`
                                  : `Element melting`,
                          }),
                          (0, j.jsx)(`dd`, {
                            className: `font-bold`,
                            children:
                              A.element.mp == null ? `—` : `${A.element.mp} °C`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  A.element.mpNote &&
                    (0, j.jsx)(`p`, {
                      className: `mt-2 text-xs text-slate-500`,
                      children: e==="it"?A.element.mpNote:({en:{"Stima: l’astato è estremamente raro e i dati macroscopici sono limitati.":"Estimate: astatine is extremely rare and macroscopic data are limited.","Sublima a pressione standard; non si indica un semplice punto di fusione.":"Sublimes at standard pressure; no simple melting point is given.","Valore riferito al fosforo bianco; il comportamento dipende dall’allotropo.":"Value for white phosphorus; behaviour depends on the allotrope."},fr:{"Stima: l’astato è estremamente raro e i dati macroscopici sono limitati.":"Estimation : l’astate est extrêmement rare et les données macroscopiques sont limitées.","Sublima a pressione standard; non si indica un semplice punto di fusione.":"Se sublime à pression standard ; pas de point de fusion simple.","Valore riferito al fosforo bianco; il comportamento dipende dall’allotropo.":"Valeur du phosphore blanc ; le comportement dépend de l’allotrope."}})[e][A.element.mpNote],
                    }),
                ],
              }),
            (0, j.jsx)(`h3`, {
              className: `mt-6 font-bold`,
              children:
                e === `it`
                  ? `Domande possibili`
                  : e === `fr`
                    ? `Questions possibles`
                    : `Possible questions`,
            }),
            (0, j.jsx)(`div`, {
              className: `mt-2 flex flex-wrap gap-2`,
              children: Tt(A, o.audience, o.level).map((t) =>
                (0, j.jsx)(
                  `span`,
                  {
                    className: `rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-950`,
                    children: Te[t]?.label?.[e] || t,
                  },
                  t,
                ),
              ),
            }),
            legacyLevel(o.level) === `expert` &&
              (0, j.jsxs)(j.Fragment, {
                children: [
                  (0, j.jsx)(`h3`, {
                    className: `mt-6 font-bold`,
                    children:
                      e === `it`
                        ? `Dati esperti`
                        : e === `fr`
                          ? `Données expertes`
                          : `Expert data`,
                  }),
                  (0, j.jsxs)(`div`, {
                    className: `mt-2 rounded-2xl border p-4 text-sm`,
                    children: [
                      (0, j.jsxs)(`p`, {
                        children: [
                          (0, j.jsxs)(`b`, {
                            children: [
                              e === `it`
                                ? `Cattura neutronica termica (n,γ)`
                                : e === `fr`
                                  ? `Capture neutronique thermique (n,γ)`
                                  : `Thermal neutron capture (n,γ)`,
                              `:`,
                            ],
                          }),
                          ` `,
                          (A.expert.neutronCapture?.thermalBarn ??
                            A.expert.thermalNeutronCaptureBarn) == null
                            ? e === `it`
                              ? `valore non ancora trascritto nella carta`
                              : e === `fr`
                                ? `valeur non encore transcrite dans la fiche`
                                : `value not yet transcribed into the card`
                            : `${(A.expert.neutronCapture?.thermalBarn ?? A.expert.thermalNeutronCaptureBarn).toLocaleString(e)} ± ${A.expert.neutronCapture?.uncertaintyBarn?.toLocaleString(e) ?? `–`} b`,
                        ],
                      }),
                      (0, j.jsx)(`p`, {
                        className: `mt-2 text-xs text-slate-500`,
                        children: ({it:"Cinque valori termici ereditati dalla versione precedente, riferiti alla cattura a 2200 m/s; non rivalidati in questa revisione.",en:"Five thermal values inherited from the previous version, referring to capture at 2200 m/s; not revalidated in this revision.",fr:"Cinq valeurs thermiques héritées de la version précédente, concernant la capture à 2200 m/s ; non revalidées dans cette révision."})[e],
                      }),
                      A.expert.neutronCapture &&
                        (0, j.jsxs)(`p`, {
                          className: `mt-2 text-xs font-medium text-indigo-700`,
                          children: [
                            A.expert.neutronCapture.status ===
                            `curated_thermal_value`
                              ? `IAEA INDC(NDS)-440`
                              : `IAEA NGATLAS`,
                            ` · `,
                            A.expert.neutronCapture.reaction,
                            ` · `,
                            A.expert.neutronCapture.energyRange,
                          ],
                        }),
                    ],
                  }),
                ],
              }),
            (0, j.jsxs)(`div`, {
              className: `mt-6 rounded-xl border p-3 text-sm text-slate-600`,
              children: [
                (0, j.jsxs)(`b`, { children: [n.sourceStatus, `:`] }),
                ` `,
                A.original ? n.original : n.expanded,
                (0, j.jsx)(`div`, {
                  className: `mt-3 flex flex-wrap gap-2`,
                  children: St(A).map((e) =>
                    (0, j.jsx)(
                      `a`,
                      {
                        className: `rounded bg-slate-100 px-2 py-1 text-xs underline`,
                        target: `_blank`,
                        rel: `noreferrer`,
                        href: e.url,
                        children: e.label,
                      },
                      e.url,
                    ),
                  ),
                }),
              ],
            }),
          ],
        }),
      pendingQuery && j.jsxs(At,{close:()=>setPendingQuery(null),children:[j.jsxs('div',{className:'confirm-query',children:[j.jsx('h2',{children:({it:'Conferma la domanda',en:'Confirm the question',fr:'Confirmez la question'})[e]}),j.jsx('p',{children:pendingQuery.text}),j.jsx('p',{children:formatQuery(pendingQuery.query,e)}),j.jsx('button',{className:'confirm',onClick:()=>{const p=pendingQuery;setPendingQuery(null);rt(p.text,p.query,p.spontaneous);},children:({it:'Sì, chiedi questo',en:'Yes, ask this',fr:'Oui, posez cette question'})[e]}),j.jsx('button',{onClick:()=>setPendingQuery(null),children:({it:'Modifica',en:'Edit',fr:'Modifier'})[e]})]})]}),
      privacy && j.jsxs('div',{className:'privacy-screen',role:'dialog','aria-modal':true,children:[j.jsx('h2',{children:({it:'Passa il dispositivo al giocatore ',en:'Pass the device to player ',fr:'Passez l’appareil au joueur '})[e]+privacy}),j.jsx('button',{onClick:()=>setPrivacy(null),children:({it:'Sono pronto',en:'I am ready',fr:'Je suis prêt'})[e]})]}),
      guessCandidate && j.jsxs(At,{close:()=>setGuessCandidate(null),children:[j.jsx('h2',{children:multiplayerText[e].confirmGuess}),j.jsx('p',{children:guessCandidate.name[e]}),j.jsx('button',{className:'confirm',onClick:()=>{const card=guessCandidate;setGuessCandidate(null);ct(card);},children:multiplayerText[e].confirmGuess}),j.jsx('button',{onClick:()=>setGuessCandidate(null),children:multiplayerText[e].cancel})]}),
      Oe && (0, j.jsx)(Pt, { lang: e, context: Ae, close: () => ke(!1) }),
    ],
  });
}
function It({
  t: e,
  lang: t,
  winner: n,
  p1: r,
  p2: i,
  showDetail: a,
  restart: o,
}) {
  let s = n === `AI` ? e.computer : `${e.player} ${n}`,
    c = n === `AI` ? r : n === 1 ? i : r;
  return (0, j.jsxs)(`div`, {
    className: `mx-auto max-w-2xl rounded-3xl border bg-white p-8 text-center`,
    children: [
      (0, j.jsx)(T, { className: `mx-auto h-12 w-12 text-amber-500` }),
      (0, j.jsxs)(`h1`, {
        className: `mt-4 text-4xl font-black`,
        children: [s, ` `, e.winner],
      }),
      (0, j.jsx)(`p`, { className: `mt-5 text-slate-600`, children: e.reveal }),
      (0, j.jsx)(`div`, {
        className: `mx-auto mt-4 max-w-xs`,
        children: (0, j.jsx)(kt, { item: c, lang: t, onClick: () => a(c) }),
      }),
      (0, j.jsxs)(`button`, {
        onClick: o,
        className: `mt-8 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white`,
        children: [
          (0, j.jsx)(le, { className: `mr-2 inline h-4 w-4` }),
          e.newGame,
        ],
      }),
    ],
  });
}
(0, v.createRoot)(document.getElementById(`root`)).render(
  (0, j.jsx)(_.StrictMode, { children: (0, j.jsx)(Ft, {}) }),
);

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
