import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx", "**/*.mjs"],
    plugins: {
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-hooks/refs": "off",
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        JSX: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        queueMicrotask: "readonly",
        fetch: "readonly",
        URL: "readonly",
        process: "readonly",
        Map: "readonly",
        Set: "readonly",
        Promise: "readonly",
        Date: "readonly",
        Object: "readonly",
        Array: "readonly",
        JSON: "readonly",
        Math: "readonly",
        IntersectionObserver: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        sessionStorage: "readonly",
        localStorage: "readonly",
        atob: "readonly",
        btoa: "readonly",
        TextDecoder: "readonly",
        TextEncoder: "readonly",
        Uint8Array: "readonly",
        URLSearchParams: "readonly",
        HTMLElement: "readonly",
      },
    },
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
      },
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
  },
  {
    files: ["src/lib/encryption.js"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
      },
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "*.config.*"],
  },
];
