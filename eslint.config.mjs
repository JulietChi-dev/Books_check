import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@prisma/client",
              message:
                "Import Prisma only inside the data-access module (lib/db.ts). All other files must use the data-access module (PRD 8.5 point 3).",
            },
          ],
          patterns: [
            {
              group: ["@prisma/client/*", "**/prisma/client/**"],
              message:
                "Import Prisma only inside the data-access module (lib/db.ts). All other files must use the data-access module (PRD 8.5 point 3).",
            },
          ],
        },
      ],
    },
  },
  {
    // The data-access module is the ONLY module permitted to import the Prisma client
    files: ["lib/db.ts", "lib/db.js"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
