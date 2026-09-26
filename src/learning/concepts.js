import taxonomy from './data/concepts.json' with {type: 'json'};
export const CONCEPTS = Object.freeze(Object.fromEntries(taxonomy.concepts.map(c => [c.id, Object.freeze(c)])));
// Canonical package IDs win over spelling variants in narrative/historical documents.
const aliases = {
  'radioactivity.natural_artificial':'radioactivity.natural_and_artificial',
  'risk.contextual_reasoning':'radioactivity.risk_context',
  'isotope.element_vs_isotope':'nuclide.element_vs_isotope',
  'decay.gamma_transition':'radiation.gamma_transition',
  'decay.mode_vs_radiation':'concept.decay_mode_vs_radiation',
  'half_life.scale':'half_life.order_of_magnitude', 'half_life.comparison':'half_life.order_of_magnitude',
  'nucleus.atomic_number':'nuclide.Z', 'nucleus.mass_number':'nuclide.A',
  'nucleus.neutron_number':'nuclide.N', 'nucleus.n_equals_a_minus_z':'nuclide.N_equals_A_minus_Z',
  'application.pet':'medical.pet', 'application.spect':'medical.spect', 'application.therapy':'medical.therapy',
  'application.astronomy_cosmogenic':'application.cosmogenic_astronomy',
  'question.discrimination':'reasoning.discriminating_question', 'nuclear.activation':'radioactivity.activation_nuance',
};
export const canonicalConcept = id => CONCEPTS[id] ? id : aliases[id] || null;
export const learningValue = ids => ids.some(id => CONCEPTS[id]?.status === 'core') ? 'core'
  : ids.some(id => CONCEPTS[id]?.status === 'supporting') ? 'supporting' : 'secondary';
