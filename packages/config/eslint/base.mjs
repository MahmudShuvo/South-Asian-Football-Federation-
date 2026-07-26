import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/**
 * Base ESLint configuration for every package in the monorepo.
 *
 * Type-aware linting is enabled (`recommendedTypeChecked`). It is slower than
 * the syntactic-only preset, but it is the only way to catch the class of bug
 * that actually hurts a data-heavy app: unhandled promises, unsafe `any` flowing
 * out of JSON parsing, and misuse of nullable database fields.
 */
export default tseslint.config(
  { ignores: ["**/dist/**", "**/.next/**", "**/coverage/**", "**/node_modules/**", "**/*.d.ts"] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      /* Unused code is a warning, not an error. Blocking a commit because a
         variable is temporarily unused trains people to bypass the hook. */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],

      /* Floating promises are the single most common source of silent data-loss
         bugs in an ingestion pipeline. Always an error. */
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      /* Prefer `import type` so type-only imports are erased at build time. */
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      /* `any` is a warning during scaffolding and should be tightened to error
         once the domain types exist (Day 3). Tracked in docs/DECISIONS.md. */
      "@typescript-eslint/no-explicit-any": "warn",

      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  /* Config files run in Node and are not part of the app's type project. */
  {
    files: ["**/*.{mjs,cjs,js}", "**/*.config.{ts,mts}"],
    ...tseslint.configs.disableTypeChecked,
  },

  /* Must stay last: switches off every stylistic rule Prettier owns. */
  prettier,
);
