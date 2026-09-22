# Mathemagic: TypeScript compiler metrics

 This report contains the methodology, measurements and links to the raw results used in the article.

## Scope

Commit `dc7833fb59bae13a729cab61eea1ddc6b956d1ff`; 25 source files, 519 source lines, 22 test files. Windows 11, Ryzen 5 4600H, 12 logical processors, 7.42 GiB OS-visible RAM. Every final compiler/test command used Node v24.19.0. Dependencies were locked and installed before timing.

105 measured compiler runs, plus warm-ups; 18 separate resource runs; 9 measured workflow runs plus 3 warm-ups. No hosted CI or npm publication was performed.

## Compiler wall time

Seconds, seven runs per row. Clean builds remove outputs but retain OS file caches. Quartiles use the Python statistics exclusive method. All measured compiler exits were zero.

| Scenario | Config | TypeScript | Median | Min–max | Q1–Q3 |
| --- | --- | --- | ---: | ---: | ---: |
| clean | aligned | 5.9.3 | 2.463 | 2.431–2.507 | 2.441–2.470 |
| clean | aligned | 6.0.3 | 2.597 | 2.539–2.821 | 2.545–2.798 |
| clean | aligned | 7.0.2 | 0.615 | 0.594–0.634 | 0.598–0.627 |
| clean | lean | 5.9.3 | 1.078 | 1.056–1.206 | 1.061–1.118 |
| clean | lean | 7.0.2 | 0.406 | 0.401–0.452 | 0.405–0.421 |
| clean | original | 5.9.3 | 4.637 | 4.519–5.262 | 4.528–4.651 |
| incremental_edit | aligned | 5.9.3 | 0.936 | 0.920–0.973 | 0.932–0.952 |
| incremental_edit | aligned | 6.0.3 | 0.925 | 0.921–0.936 | 0.923–0.935 |
| incremental_edit | aligned | 7.0.2 | 0.199 | 0.192–0.218 | 0.194–0.211 |
| incremental_nochange | aligned | 5.9.3 | 0.818 | 0.803–0.881 | 0.804–0.848 |
| incremental_nochange | aligned | 6.0.3 | 0.797 | 0.791–0.989 | 0.792–0.817 |
| incremental_nochange | aligned | 7.0.2 | 0.191 | 0.183–0.216 | 0.185–0.200 |
| noemit | aligned | 5.9.3 | 2.342 | 2.326–2.490 | 2.334–2.401 |
| noemit | aligned | 6.0.3 | 2.435 | 2.368–2.453 | 2.410–2.450 |
| noemit | aligned | 7.0.2 | 0.576 | 0.560–0.593 | 0.566–0.577 |

Aligned clean build: TypeScript 7 is 4.23× faster than TypeScript 6 (76.3% less elapsed time; 1.983s saved).

## Sampled process-tree memory

MiB of resident memory. Three additional clean builds per row. Includes the native child and Node launcher for TypeScript 7. Sampling uses a 5ms delay plus enumeration overhead; these are approximate peaks, not guaranteed maxima. Timings from these instrumented runs are excluded from the wall-time table.

| Config | TypeScript | Median sampled peak | Min–max |
| --- | --- | ---: | ---: |
| original | 5.9.3 | 515.1 | 472.8–524.0 |
| aligned | 5.9.3 | 370.5 | 369.5–376.0 |
| aligned | 6.0.3 | 374.4 | 373.7–379.1 |
| aligned | 7.0.2 | 223.9 | 222.9–226.8 |
| lean | 5.9.3 | 187.1 | 181.7–212.2 |
| lean | 7.0.2 | 127.0 | 125.7–130.4 |

## Local workflow

Build → ESLint → Jest. Three measured runs, after one warm-up, per compiler. Jest is serial and uncached. Test/lint tooling retains TypeScript 5.9.3. Stage medians need not sum to the median total.

| Build compiler | Build median | Lint median | Test median | Total median | Total min–max |
| --- | ---: | ---: | ---: | ---: | ---: |
| 5.9.3 | 2.506s | 1.625s | 5.894s | 10.022s | 9.991–10.381s |
| 6.0.3 | 2.582s | 1.586s | 5.928s | 10.107s | 10.045–10.122s |
| 7.0.2 | 0.602s | 1.594s | 5.967s | 8.196s | 8.089–8.573s |

Total median improvement, 6 → 7: 18.9% less time (1.911s saved, 1.23× faster). All stages passed; all 44 tests in 22 suites passed in every final workflow run.

## Output and compatibility

- Original config: 5.9.3 builds successfully; 6.0.3 reports ES5 deprecation and source-root errors; 7.0.2 reports ES5 removal and source-root errors.
- Aligned config: all three compile without errors.
- All aligned builds emit 25 JavaScript files and 25 declaration files, totalling 27,808 bytes. Text contents match across versions, with no differing files after normalising line endings for the content comparison. File sizes are measured from disk.
- Plain Node import fails for every aligned build and the original ES5 build: `matrixPower.js` requires `../../src/index`, which is absent from the generated package layout. Source-based Jest tests pass because they import the TypeScript source. No conclusion was drawn about the separately published npm tarball.
- This investigation is not a release-ready compiler migration. ES5 compatibility and the existing packaging problem need separate decisions/work.

## Raw records

- [Individual timings (CSV)](results/timings.csv) and [timings with exit codes (JSON)](results/timings.json).
- [Compiler diagnostics](results/diagnostics.json): file/type/instantiation counts, compiler-reported phase timings and internal memory figures. Internal memory figures are not treated as cross-runtime RSS comparisons.
- [Resource samples](results/resources.json): observed peak RSS, sample count and last-observed CPU lower bounds. CPU samples are incomplete and are not used to claim exact CPU or energy savings.
- [Workflow runs and test output](results/workflow.json).
- [Generated-output comparisons and smoke failures](results/verification.json).
- [Original configuration diagnostics](results/original-compatibility.json).
- [Environment and source lockfile hash](results/environment.json).

Initial workflow discovery failures caused by nesting the source under `node_modules` are preserved separately and excluded. Final workflow runs used an equivalent source copy outside that ancestor with the same dependency installation.
