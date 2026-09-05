# Migrate To Current TypeScript And ESLint

Historical reference: this describes the earlier ESLint upgrade. The template now uses
Oxlint and Oxfmt; see the root README for the current setup.

This repo moved from:

- `typescript@^6.0.1-rc`
- `eslint@^9`
- `eslint-config-xo-typescript@^9`
- older `typescript-eslint` resolution under `pkg/eslint-config`

to:

- `typescript@^6.0.2`
- `eslint@^10.2.0`
- `eslint-config-xo@^0.51.0`
- `typescript-eslint@^8.58.1`

Before you start, capture what your current lint setup is actually doing. Do not rely on package names alone.

For a representative TS file, print the effective config and keep the parts that matter to you:

```bash
npx eslint --print-config path/to/file.ts
```

Useful things to record:

- which parser is active
- whether type-aware linting is enabled
- which import rules are on or off
- which resolver settings are present

Then compare the post-migration result instead of assuming the new stack preserved behavior.

## 1. Upgrade TypeScript At The Root

Prefer using npm to update manifests and the lockfile together:

```bash
npm install --save-dev typescript@^6.0.2
```

Avoid hand-editing `package.json` when a package manager command expresses the change directly.

## 2. Upgrade Package-Local ESLint Runtime

If workspace packages invoke `eslint` directly, bump them to ESLint 10 too.

Use `npm install` in the relevant workspace instead of editing manifests manually.

In this repo that applied to `pkg/base/package.json`, which needed to stay aligned with the shared ESLint package.

## 3. Replace The Shared ESLint Stack

In `pkg/eslint-config/package.json`:

- remove `@eslint/js`
- remove `@typescript-eslint/parser`
- remove `eslint-config-xo-typescript`
- remove direct `eslint-plugin-import-x`
- remove direct `eslint-plugin-unicorn`
- add `eslint@^10.2.0`
- add `eslint-config-xo@^0.51.0`
- add `typescript@^6.0.2`
- add `typescript-eslint@^8.58.1`

Use package-manager commands to do that swap, then inspect the manifest to make sure the dependency graph reflects the intended ownership:

- `eslint-config-xo` now provides the base XO rule stack
- `typescript-eslint` provides the parser and typed-rule integration point
- explicit `typescript` keeps npm from installing an older nested peer copy

The explicit `typescript` dependency matters. Without it, npm can install a nested older TS peer under `pkg/eslint-config`.

## 4. Update The Shared Flat Config

Replace the old layered config:

- `@eslint/js`
- `typescript-eslint` strict configs
- `eslint-config-xo-typescript`
- `eslint-plugin-import-x` flat configs
- `eslint-plugin-unicorn` configs

with the newer XO model:

- spread `eslintConfigXo()`
- keep `eslint-plugin-prettier/recommended`
- keep repo-specific overrides in one local config block
- set `languageOptions.parser` to `tseslint.parser`
- enable `parserOptions.projectService`

The important migration skill here is not copying a whole file. It is recognizing which concerns now come from XO and which ones still belong to your repo-specific layer.

## 5. Restore The Import Checks You Still Care About

`eslint-config-xo@0.51.0` intentionally leaves some TS import checks off. That is not necessarily wrong, but if your older setup was already working well, inspect what you actually lost instead of assuming XO covers it.

In this repo, the useful rules to restore were:

- `import-x/export`
- `import-x/no-unresolved`
- `n/file-extension-in-import`
- `settings["import-x/resolver"].typescript = true`

This is the part where you should compare behavior, not just package names. If TS workspace imports or TS path resolution got weaker after the migration, that is a signal to restore the specific checks rather than layering the entire old stack back in.

Some rules can stay disabled if there is a strong reason. In this repo, `import-x/default` and `import-x/named` were left off because that matched the effective TS behavior of the older working setup too.

## 6. Important Type-Checked JS Note

`eslint-config-xo@0.51.0` enables typed `typescript-eslint` parsing for TS files, but it does not assume type-checked JS for your own custom JS config files.

If you run custom `@typescript-eslint` typed rules against `.js` files such as `pkg/eslint-config/internal.js`, you must explicitly set:

- `languageOptions.parser = tseslint.parser`
- `languageOptions.parserOptions.projectService = true`

That was the key fix for errors like:

```text
Error while loading rule '@typescript-eslint/naming-convention': You have used a rule which requires type information...
```

This works here because `pkg/eslint-config/tsconfig.json` already has:

- `allowJs: true`
- `checkJs: true`

## 7. Reinstall Everything

After updating manifests:

```bash
npm install
```

Prefer package-manager commands throughout the migration. Reach for manual manifest edits only when you are changing config structure rather than package state.

## 8. Verify The Result

Run:

```bash
npm run lint
npm run check
npm ls typescript --all
```

Expected result:

- lint passes
- check passes
- only `typescript@6.0.2` remains in the dependency tree
- no nested `typescript@5.x` under `pkg/eslint-config`
- the intended TS import checks are active again
