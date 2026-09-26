# Brief for INFN DPO / internal review

**Purpose:** obtain a concrete decision before activating remote research logging.

## Project in one paragraph

*Guess the Radionuclide* is an INFN-origin science communication/educational card game being developed as a browser-based serious game. The research objective is to evaluate whether one structured gameplay session can improve conceptual understanding of radioactivity and broaden knowledge of its applications. The planned population includes school students aged 14+ and adults.

## Proposed data flow

1. Participant opens the web application.
2. Normal learning profile stays locally in browser.
3. Research logging is OFF by default.
4. A study code activates a study-specific information/authorization flow.
5. Eligible participant completes minimal baseline profile and pre-test.
6. Gameplay generates structured research events.
7. Participant completes post-test.
8. Pseudonymous data are uploaded to an approved research backend.
9. Direct identifiers are not planned in the analysis dataset.

## Planned categories of data

- age band, not exact DOB;
- broad educational background;
- prior education in radioactivity;
- pre/post responses;
- structured gameplay actions;
- learning interventions and results;
- timing;
- optional controlled open-text research item.

Not planned by default: name/surname, personal email, exact DOB, exact address/location, raw free-text gameplay questions, device fingerprint.

## Questions requiring INFN decision

1. Correct Article 6 GDPR legal basis for the study?
2. For 14–17-year-old school participants, what information/parental authorization/minor assent procedure is required?
3. Role of the school: independent controller, joint controller, processor, or recruitment site only?
4. Is an ethics/research approval process required in addition to privacy review?
5. Must the processing be entered in the INFN Record of Processing Activities, and by which structure?
6. Is a DPIA required or recommended?
7. Appropriate retention period?
8. Is Firebase/Google acceptable as processor for this study, under what region/contract/transfer safeguards?
9. Would INFN-hosted infrastructure be preferred for research data?
10. Is GitHub Pages acceptable for the public study client, or should the research version be served from an INFN domain?
11. How should parental authorization evidence be collected and stored?
12. What withdrawal/deletion mechanism is required?
13. Can a random participant token link pre-test, gameplay and post-test without identity?
14. Is a delayed post-test permitted without collecting email, e.g. through a return token?

## Technical safeguards proposed

- research transport separate from multiplayer transport;
- research logging disabled by default;
- random participant IDs;
- authorization records separated from analysis dataset;
- no raw gameplay free text by default;
- least-privilege database rules;
- configurable retention;
- no advertising or analytics SDK required;
- no Google Analytics planned.

## INFN contact

DPO: dpo@infn.it

The final study-specific notice, legal basis, minor procedure and processor wording must be validated by INFN before activation.
