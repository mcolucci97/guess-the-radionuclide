// The only scientific game adapter. The learning core accepts structured data and pure evaluations.
import {Ge,validQuery,formatQuery,Se} from '../engine/advanced.js';
import {conceptsForQuery} from './conceptMapping.js';
import {partitionCandidates,questionQuality} from './questionQuality.js';
export function describeQuestion({query, cards, answer, level, language='it', reliable=true, automatic=false, spontaneous=false, actionId}) {
  const accepted=validQuery(query) && reliable;
  const partition=accepted?partitionCandidates(cards,query,(card,q)=>Ge(card,q,language)):{yesIds:[],noIds:[],unknownIds:cards.map(c=>c.id)};
  const conceptIds=accepted?conceptsForQuery(query,level):[];
  return {actionId, query:accepted?query:null, reliable:!!accepted, language, automatic, spontaneous,
    candidateIds:cards.map(c=>c.id), answer, conceptIds, ...partition,
    expectedIds:answer?partition.noIds:partition.yesIds,
    quality:questionQuality({yesCount:partition.yesIds.length,noCount:partition.noIds.length,unknownCount:partition.unknownIds.length,conceptIds})};
}
export function propertyText(card, query, lang) {
  if (!card || !query) return '';
  if (['halfLifeSeconds','meanLifeSeconds'].includes(query.property) || query.queryType==='timeOrder' || query.conceptId?.startsWith('time.')) return `T½ = ${Se(card.seconds,lang)}`;
  if (['Z','A','N'].includes(query.property)) return query.property==='N'?`N = A − Z = ${card.A} − ${card.Z} = ${card.A-card.Z}`:`${query.property} = ${card[query.property]}`;
  if (query.property==='meltingPointC') return `${card.element.mp} °C`;
  const result=Ge(card,query,lang);
  return `${formatQuery(query,lang)} → ${result.type==='ok'?({it:['NO','SÌ'],en:['NO','YES'],fr:['NON','OUI']})[lang][+result.yes]:'?'}`;
}
export function lensAllowed(query) {
  return query?.conceptId?.startsWith('chemistry.') || query?.property==='meltingPointC';
}
