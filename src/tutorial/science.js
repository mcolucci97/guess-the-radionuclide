// Exact, language-neutral models. Pedagogical nucleon reactions are not Q-value equations.
export const TRANSFORMATIONS = Object.freeze([
  {id:'alpha', symbol:'α', equation:'α = 2p + 2n', deltaA:-4, deltaZ:-2},
  {id:'minus', symbol:'β−', equation:'n → p + e− + ν̄e', deltaA:0, deltaZ:1},
  {id:'plus', symbol:'β+', equation:'p → n + e+ + νe', deltaA:0, deltaZ:-1},
  {id:'capture', symbol:'EC', equation:'p + e− → n + νe', deltaA:0, deltaZ:-1},
  {id:'gamma', symbol:'γ', equation:'X* → X + γ', deltaA:0, deltaZ:0},
]);
export const PET_DECAY = '¹⁸F → ¹⁸O + e+ + νe';
export const ANNIHILATION = 'e+ + e− → 2γ';
export const remainingFraction = halfLives => 2 ** -halfLives;
export const STRATEGIES = ['betaMinus','betaPlus','shortHalfLife','highZ'];
export function matchesStrategy(card, question) {
  if(question==='betaMinus')return card.modes.includes('beta-');
  if(question==='betaPlus')return card.modes.includes('beta+');
  if(question==='shortHalfLife')return card.seconds < 86400;
  if(question==='highZ')return card.Z > 20;
  throw new Error('Unknown tutorial question');
}
