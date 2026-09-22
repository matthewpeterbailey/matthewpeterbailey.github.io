---
title: Benchmarking TypeScript 7 on Mathemagic
date: 2026-09-22
tag: TypeScript
summary: Investigating compiler performance against a small mathematics library.
slug: benchmarking-typescript-7-on-mathemagic
sample: false
---

I wanted to see how much difference a faster TypeScript compiler makes to a small library and how much of that improvement reaches the rest of the development workflow. [Mathemagic](https://github.com/matthewpeterbailey/mathemagic) is my mathematics and statistics package. The snapshot used here contains 25 TypeScript source files and 519 lines of source. It is a useful counterpoint to the large applications in Microsoft's benchmarks: small enough that process startup and configuration can make a substantial difference to the result.

To investigate, I compared three compiler versions on Mathemagic. TypeScript 7 completed a clean build about **4.2 times faster than TypeScript 6** with matching settings. Once linting and tests were included, the local workflow took **19% less time**. The investigation also exposed a packaging problem that the existing tests did not catch.

## I started with a reproducible baseline

I moved to an isolated directory and installed locked dependencies with `npm ci --ignore-scripts`. That kept unfinished local changes out of the experiment and prevented installation from triggering a build. The package itself was left unchanged.

The lockfile resolves TypeScript 5.9.3. I kept that as the baseline and installed 6.0.3 and 7.0.2 separately, using npm aliases:

```sh
npm install --ignore-scripts ts6@npm:typescript@6.0.3 ts7@npm:typescript@7.0.2
```

That command ran in a separate toolchain directory. Each compiler could then build the same source without replacing the TypeScript dependency used by the existing test and lint tools. I saved the toolchain lockfile and checked each compiler's reported version before measuring it.

## Then, I tried to make the comparison fair

The original configuration targets ES5. TypeScript 6 reports that target as deprecated; TypeScript 7 rejects it. Both newer compilers also require an explicit `rootDir` for this project's output layout. These changes are covered in the [TypeScript 6 migration notes](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/). For the experiment, I used ES2015, an explicit source root and matching library and ambient-type settings across all three versions. CommonJS output, strict checking and declaration generation remained enabled. I did not enable `skipLibCheck`.

Changing the JavaScript target is a compatibility decision for a published library. These settings belong to the experiment; a faster build would not justify silently changing what consumers receive.

There is another subtle difference: TypeScript 6 defaults `types` to an empty list, whereas earlier versions automatically include visible `@types` packages. An upgrade can therefore change both how quickly the compiler works and how much work it does. The experimental configuration extended the original file with these overrides:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2015",
    "lib": ["ES2015", "DOM"],
    "rootDir": "./src",
    "types": ["jest", "node"],
    "outDir": "./.bench-output",
    "skipLibCheck": false,
    "noEmitOnError": true
  }
}
```

## The compiler measurements

I used Windows 11, a Ryzen 5 4600H with 12 logical processors, roughly 8 GB of RAM and an explicitly pinned Node 24.19.0 executable.

A small Python harness launched each compiler and measured elapsed time through to its exit. I tested four common situations:

- **Clean build:** compile the whole project and generate its JavaScript and type declaration files from scratch.
- **Type-check only:** check the code for type errors without generating any files.
- **Incremental build with no changes:** run the compiler again when none of the source files has changed.
- **Incremental build after an edit:** make a small change inside one function, then rebuild only what the compiler determines is necessary.

Each scenario had one warm-up followed by seven measured runs, reversing compiler order between rounds. I saved the individual timings and exit codes, then calculated medians and ranges. Installation and output cleanup happened outside the timed region; process startup was included.

Here are the median results with the aligned configuration:

| Scenario | TypeScript 5.9.3 | TypeScript 6.0.3 | TypeScript 7.0.2 |
| --- | ---: | ---: | ---: |
| Clean build, including declarations | 2.46 s | 2.60 s | 0.61 s |
| Type-check only | 2.34 s | 2.44 s | 0.58 s |
| Incremental build with no changes | 0.82 s | 0.80 s | 0.19 s |
| Incremental build after an edit    | 0.94 s | 0.93 s | 0.20 s |

The TypeScript 7 clean builds ranged from 0.59 to 0.63 seconds, compared with 2.54 to 2.82 seconds for TypeScript 6, and the improvement was consistent across these runs.

For the edited-file test, I made a tiny change inside one function that did not alter how other code uses it. This shows how quickly each compiler can process a routine code change. “Clean” means the generated files were removed before the build; I did not clear files cached by Windows. The incremental tests started a new compiler process each time but reused information saved by the previous build. They do not measure watch mode or a change that affects many other files.

Each TypeScript version also includes its own descriptions of built-in JavaScript features, such as arrays and strings. Those descriptions change between releases, so even with the same project and settings, each compiler has slightly different material to check.

## Configuration was doing more work than I expected

The untouched TypeScript 5.9.3 build took **4.64 seconds**. Some of the later improvement came from changing the project settings, so it would be misleading to credit the faster compiler for all of it.

I also tested removing ambient Jest and Node types from the library build with `types: []`. Against otherwise identical settings, that reduced the TypeScript 5.9.3 median from **2.46 to 1.08 seconds**, and TypeScript 7 from **0.61 to 0.41 seconds**.

I used TypeScript's `--extendedDiagnostics` option to see how much work sat behind those timings. The library contains 25 source files, but the original setup caused the compiler to process 207 files because it also loaded the ambient type declarations supplied by `@types/jest` and `@types/node`. Setting `types: []` for the library build reduced that to 39 files.

The test suite still needs those declarations for globals such as `describe`, `test` and Node's APIs. The practical improvement would be to give the published library and its tests separate `tsconfig` files, so each compilation includes only the source and ambient types it needs.

## How much reaches the whole workflow?

In separate measurements, sampled peak memory fell from approximately **374 MiB to 224 MiB** between TypeScript 6 and 7. Those figures include the compiler process tree, rather than comparing JavaScript heap diagnostics with Go memory diagnostics. They are medians from three runs, and sampling can miss brief peaks.

I then timed a local build, lint and test sequence. The first attempt found no tests: I had placed the isolated copy beneath `node_modules`, which Jest excludes. I moved the workflow's source copy outside that directory, retained the same locked dependencies and reran it with the original Jest configuration. The failed setup runs were excluded from the results.

After one warm-up, I measured three complete sequences per version. The median fell from **10.11 seconds to 8.20 seconds**: about **19% less time**. Linting still took around 1.6 seconds and tests around 6 seconds. Saving nearly two seconds in compilation could only remove those two seconds from the whole sequence.

All 44 tests across 22 suites passed. ESLint and ts-jest retained the existing TypeScript 5.9.3 dependency; only the build compiler changed. This was a staged migration experiment, not evidence that every tool could immediately switch to TypeScript 7. It was also a local sequence with serial, uncached Jest runs, not a measurement of hosted CI.

## What I would take into an upgrade

The native compiler offers a useful improvement even on this small library. The [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) explains the move to native code and parallel execution; this experiment measures their combined effect with the default settings, rather than trying to attribute the gain to either one separately.

Before upgrading, I would record how long the current build, lint and test steps take, then check which JavaScript versions the package still needs to support. After switching compilers, I would rerun those measurements, inspect the generated package and confirm that tools such as ESLint and ts-jest still work. Some of those tools use TypeScript's compiler API, which changed in TypeScript 7, so a successful `tsc` build is not enough on its own. I would also decide whether consumers still need ES5 output, and separate the library's ambient types from its test configuration. Those decisions would give the compiler upgrade a sound baseline.

The [full metrics and raw results](metrics.md) are available alongside this draft.
