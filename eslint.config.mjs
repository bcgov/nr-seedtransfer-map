import pluginJs from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "docs/Version_7_0/**",
    ],
  },
  {
    files: ["docs/scripts/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.jquery,
        ...globals.amd,
        esri: "readonly",
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      // Catch logical issues & accidental globals
      "no-undef": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-constant-condition": "warn",
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "no-console": "off",
    },
  },
  prettierConfig,
];
