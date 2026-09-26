// Normal domain values. The legacy vocabulary is confined to compatibility boundaries.
export const LEVELS = Object.freeze(['explorer', 'scientist']);
export function learningLevel(value) {
  return value === 'scientist' || value === 'expert' ? 'scientist' : 'explorer';
}
export const legacyLevel = value => learningLevel(value) === 'scientist' ? 'expert' : 'intermediate';
export const defaultAssistance = value => learningLevel(value) === 'scientist' ? 'manual' : 'assisted';
export function normalConfig(config = {}) {
  const level = learningLevel(config.level);
  return {...config, audience: 'adult', level, assist: defaultAssistance(level)};
}
export function onlineConfig(config) {
  return {...config, audience: config.audience || 'adult', level: legacyLevel(config.level)};
}
