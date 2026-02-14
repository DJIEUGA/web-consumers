import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Global ignores
  { ignores: ["dist"] },

  // 2. Base JS config (applies to all files)
  js.configs.recommended,

  // 3. TypeScript specific config
  {
    files: ["**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
        "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^[A-Z_]" },
      ],
    },
  },

  // 4. Special handling for JS files (like vite.config.js)
  // This prevents the "cannot read tsconfig" error for JS files
  {
    files: ["**/*.{js,jsx}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
