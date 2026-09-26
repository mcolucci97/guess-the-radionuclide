# Package changelog — V3 FINAL

Changes consolidated on 2026-09-25:

- froze normal user-facing levels to exactly Explorer / Scientist;
- added explicit compatibility adapter for legacy multiplayer `base/intermediate/expert`;
- defined Explorer -> legacy `intermediate`, Scientist -> legacy `expert` for new online room serialization until a deliberate Firebase schema migration;
- deferred/hid Child/Adult as a normal mandatory setup choice; V1 target is age 14+;
- corrected Firebase documentation to the real current `RN_FIREBASE_CONFIG` build contract;
- marked production multiplayer as stable and out of redesign scope;
- added irradiation vs contamination/exposure as an Explorer concept;
- added Scientist activation nuance as supporting content;
- made environment and natural radioactivity separate breadth concepts;
- removed Tb-149 from the frozen anchor list because it was not part of the explicitly frozen set;
- retained RRCI V0.1 as current research candidate instrument set, still NOT VALIDATED;
- clarified that research transport remains disabled and multiplayer Firebase is not a research backend.
