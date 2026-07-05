import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

// ESLint 9 flat config, replacing .eslintrc.json — `next lint` is deprecated
// and slated for removal in Next.js 16. FlatCompat bridges eslint-config-next's
// legacy-format shareable configs into flat config; this is the same bridge
// Next.js's own tooling (and create-next-app) generates for this migration.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
