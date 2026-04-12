import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
// @ts-expect-error no types vended
import xoTypeScript from "eslint-config-xo-typescript";
import { flatConfigs } from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unicornPlugin from "eslint-plugin-unicorn";
import { configs as tseslintConfigs } from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "**/*.json",
      "**/*.jsonc",
      "**/*.json5",
      "**/tsconfig.json",
      "**/eslint.config.{js,mjs,cjs}",
      ".vscode/*.json",
    ],
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  eslint.configs.recommended,
  ...tseslintConfigs.strictTypeChecked,
  ...tseslintConfigs.stylisticTypeChecked,
  unicornPlugin.configs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ...xoTypeScript,
  flatConfigs.recommended,
  flatConfigs.typescript,
  eslintPluginPrettierRecommended,
  {
    name: "@repo/eslint-config",
    rules: {
      curly: "error",
      "capitalized-comments": "off",
      radix: "off",
      camelcase: [
        "error",
        {
          ignoreImports: true,
          // Object property names commonly come from external APIs
          // (query params, JSON payloads) that use snake_case, so skip
          // checking them here. The @typescript-eslint/naming-convention
          // rule still enforces camelCase/UPPER_CASE for variables.
          properties: "never",
        },
      ],
      // @typescript-eslint rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      // May increase refactoring effort down the lien
      "@typescript-eslint/require-await": "off",
      // Import rules
      // This is important when using npm workspaces
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["!./src/**/*"],
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
      "import-x/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always",
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
        },
      ],
      "import-x/default": "off",
      "import-x/extensions": "off",
      // Unicorn rules
      "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
      "unicorn/numeric-separators-style": [
        "warn",
        { onlyIfContainsSeparator: true },
      ],
      "unicorn/no-null": "error",
      // Consider enabling the following rule for better code readability and maintainability.
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
      // Can't auto-fix for isNaN and isFinite
      "unicorn/prefer-number-properties": ["warn"],
      "no-await-in-loop": "off",
    },
    settings: {
      // "import-x/internal-regex": "^@scope/*",
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
]);
