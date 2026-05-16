# Market Benchmark Prompt Pack

Use this pack after placing `MANUFACTURING\_ERP\_MARKET\_FIT\_GAP.xlsx` in the repo under:

`docs/market-benchmark/MANUFACTURING\_ERP\_MARKET\_FIT\_GAP\_V2.xlsx`

Run the prompts in sequence. The prompts are designed to stop Codex from guessing by forcing:

* market benchmark fit-gap scan
* transaction-line depth tests
* field/control truth
* action truth
* integration/report/dashboard/mobile truth
* final demo/UAT gates

Recommended sequence (docs\\MARKET\_BENCHMARK\_PROMPT\_PACK/):

1. `01\_FILL\_MARKET\_FIT\_GAP\_PROMPT.txt`
2. `02\_CREATE\_QUALITY\_GATES\_PROMPT.txt`
3. `03\_TRANSACTION\_LINE\_DEPTH\_PROMPT.txt`
4. `04\_MASTER\_RESOURCE\_COMMERCIAL\_PROMPT.txt`
5. `05\_PRODUCTION\_INVENTORY\_QC\_DISPATCH\_PROMPT.txt`
6. `06\_INTEGRATIONS\_AI\_REPORTING\_MOBILE\_PROMPT.txt`
7. `07\_FINAL\_UAT\_RELEASE\_PROMPT.txt`

