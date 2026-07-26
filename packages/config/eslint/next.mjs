import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import base from "./base.mjs";
import boundariesConfig from "./boundaries.mjs";

/** ESLint configuration for apps/web. */
export default [
  ...base,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,

      /* Non-negotiable for our 2s LCP budget on South Asian 4G: raw <img>
         skips Next's automatic resizing and lazy loading. */
      "@next/next/no-img-element": "error",
    },
  },

  ...boundariesConfig,
];
