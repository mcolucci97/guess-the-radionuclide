# Future Scientist cross-section module — import plan

Outside Learning Engine V1.

IAEA Nuclear Data Services provides REST APIs for the Nuclear Reaction Data Explorer, including reaction datasets, thermal neutron cross sections, residual production cross sections and EXFOR entries.

Future script: `scripts/import_cross_sections.py`

Pipeline:
1. read canonical radionuclide list;
2. read curated reaction-query manifest;
3. query IAEA REST API;
4. normalize units;
5. retain provenance (endpoint, dataset/library/EXFOR ID, retrieval date, reaction, energy, value, uncertainty where available);
6. write overlay JSON;
7. generate exceptions report;
8. require human review only for ambiguous/missing cases.

Important scientific rule: do not automatically select a "representative cross section" without a declared definition. Cross section is energy-dependent. The importer can automate retrieval, not the scientific choice of the pedagogically meaningful quantity.
