// All V3 artwork is language neutral; optional localized overrides share this fallback chain.
export const TUTORIAL_ASSETS = Object.freeze({
  nucleus: {neutral:'nucleus.webp'},
  contexts: {neutral:'contexts.webp'},
});
export function assetCandidates(asset, lang) {
  return [...new Set([asset?.localized?.[lang],asset?.neutral].filter(Boolean))]
    .map(file => `./tutorial/v3/${file}`);
}
