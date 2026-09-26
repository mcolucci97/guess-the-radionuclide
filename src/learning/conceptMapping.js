import {CONCEPTS, canonicalConcept} from './concepts.js';
import {learningLevel} from './levels.js';
const exact = {
  'physics.alpha':['decay.alpha'], 'physics.beta_minus':['decay.beta_minus'],
  'physics.beta_plus':['decay.beta_plus'], 'physics.electron_capture':['decay.electron_capture'],
  'physics.gamma':['radiation.gamma','concept.decay_mode_vs_radiation'],
  'physics.isomeric_transition':['radiation.gamma_transition'],
  'nature.natural':['radioactivity.natural_and_artificial','application.natural_radioactivity'],
  'nature.in_body':['application.natural_radioactivity'], 'nature.in_food':['application.natural_radioactivity'],
  'nature.cosmogenic':['application.cosmogenic_astronomy'],
  'nature.radon_chain':['application.radon','application.natural_radioactivity'],
  'daily.home_radon':['application.radon','application.natural_radioactivity'],
  'daily.bananas':['application.natural_radioactivity'], 'daily.archaeology':['application.dating_geoscience'],
  'daily.fdg_pet':['medical.pet'], 'daily.scintigraphy':['medical.spect'],
  'medical.pet':['medical.pet'], 'medical.spect':['medical.spect'], 'medical.therapy':['medical.therapy'],
  'chemistry.metal':['chemistry.metallicity'],
};
export function conceptsForQuery(query, level = 'explorer') {
  if (!query || query.type !== 'parsed') return [];
  let ids = [];
  if (query.queryType === 'concept') {
    const id = query.conceptId || '';
    ids = exact[id] || (id.startsWith('environment.') ? ['application.environment']
      : id.startsWith('earth.') ? ['application.dating_geoscience']
      : id.startsWith('space.') ? ['application.cosmogenic_astronomy']
      : id.startsWith('industry.') ? ['application.industry']
      : id.startsWith('time.') ? ['half_life.concept','half_life.order_of_magnitude']
      : id.startsWith('chemistry.') ? [id.includes('_at_room_temperature') ? 'chemistry.physical_state' : 'chemistry.family'] : []);
  } else if (query.queryType === 'timeOrder') ids = ['half_life.concept','half_life.order_of_magnitude'];
  else if (['numeric','range'].includes(query.queryType)) {
    const property = query.property;
    if (['halfLifeSeconds','meanLifeSeconds'].includes(property)) ids = ['half_life.concept','half_life.order_of_magnitude','half_life.quantitative','reasoning.quantitative_threshold'];
    else if (['Z','A','N'].includes(property)) ids = [`nuclide.${property}`, ...(property === 'N' ? ['nuclide.N_equals_A_minus_Z'] : [])];
    else if (property === 'meltingPointC') ids = ['chemistry.melting_point'];
    else if (property === 'principalGammaKeV') ids = ['radiation.gamma'];
  }
  // Do not infer mastery of mechanisms merely from asking about a card property.
  return [...new Set(ids)].filter(id => CONCEPTS[id] && (learningLevel(level) === 'scientist' || CONCEPTS[id].level === 'explorer'));
}
export function eventConcepts(event, level) {
  return [...new Set(event.payload.conceptIds?.map(canonicalConcept).filter(Boolean) || conceptsForQuery(event.payload.query, level))];
}
