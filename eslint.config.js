import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "coverage", "examples", "node_modules"]),
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // The public API is generic over consumer-supplied data; `any` is load
      // bearing in the type signatures rather than an oversight.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      // Tests hoist a `bump`/`swap` handle out of a throwaway component to drive
      // re-renders. That is a harness escape hatch, not product code.
      "react-hooks/globals": "off",
    },
  },
]);
