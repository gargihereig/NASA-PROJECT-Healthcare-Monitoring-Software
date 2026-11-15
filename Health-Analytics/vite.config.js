import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const reactPackage = fileURLToPath(new URL("./node_modules/react", import.meta.url));
const rechartsPackage = fileURLToPath(new URL("./node_modules/recharts", import.meta.url));

export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" }), tailwindcss()],
  resolve: {
    alias: [
      { find: /^react(?=\/|$)/, replacement: reactPackage },
      { find: /^recharts(?=\/|$)/, replacement: rechartsPackage },
    ],
  },
});
