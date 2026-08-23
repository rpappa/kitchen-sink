# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Build And Development Commands

This is a Turborepo monorepo using npm workspaces. Run tasks from the repo root:

```bash
npm run check
```

Filter to a single package with turbo:

```bash
npx turbo run typecheck --filter=@repo/pkgbase
```

## Creating A New Package

Generate a new internal package from the `@repo/pkgbase` template:

```bash
yes n | npx turbo gen workspace --copy @repo/pkgbase --type package --name @repo/<name> --destination pkg/<name>
```

(@codex and other agents; this will hang w/o network access, so if your sandbox blocks it, run with appropriate perms)

This copies `pkg/base`, keeps the just-in-time package structure intact, and places the new package under `pkg/`. Run `npm install` after generating so workspace links stay current.

## Creating A New App

Generate a new application package from the `@repo/appbase` template:

```bash
yes n | npx turbo gen workspace --copy @repo/appbase --type app --name @repo/<name> --destination app/<name>
```

This copies `app/base` and places the new application under `app/`. Run `npm install` after generating so workspace links stay current.

## Working with dependencies

Instead of making direct edits to dependency fields in `package.json`, use `npm install [-w] <pkg>` or `npm uninstall [-w] <pkg>`.

## Architecture

This repository is a starter monorepo.

- `pkg/*` contains internal packages and shared config packages.
- `app/*` contains application packages.
- `@repo/appbase` is the starter application template.
- `@repo/pkgbase` is the starter package template.
- `@repo/eslint-config` is the shared ESLint flat config.
- `@repo/tsconfig` is the shared TypeScript config.

## Package Conventions

Internal packages use the just-in-time strategy: they export raw TypeScript source and do not require a build step by default.

- JIT packages expose `src/index.ts` through `main`, `types`, and `exports`.
- Each package's `eslint.config.js` should re-export `@repo/eslint-config`.
- Each package's `tsconfig.json` should extend `@repo/tsconfig`.
- Tests live in `test/` directories and use Vitest.
- TypeScript is configured with `noEmit`; default behavior is type-check only.
- Support running with type stripping when possible, hence use `.ts` imports

## Verifying your work

`npm run check` should be all you need. It's fast due to turborepo caching. Only use other commands if you cannot isolate if it's your work that's failing or something unrelated. `npm run check` is exhaustive, you likely do not need to waste time and tokens checking with other means.