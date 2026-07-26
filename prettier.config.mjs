/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  arrowParens: "always",
  endOfLine: "lf",

  /* Sorts Tailwind classes into a canonical order. Worth having because class
     order is the main source of noisy, meaningless diffs in a Tailwind codebase. */
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./apps/web/src/styles/globals.css",
  tailwindFunctions: ["cn", "cva"],
};

export default config;
