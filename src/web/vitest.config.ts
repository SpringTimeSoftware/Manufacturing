import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const webRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@testing-library/react": resolve(webRoot, "node_modules/@testing-library/react"),
      react: resolve(webRoot, "node_modules/react"),
      "react-dom": resolve(webRoot, "node_modules/react-dom"),
      "react-router-dom": resolve(webRoot, "node_modules/react-router-dom"),
      vitest: resolve(webRoot, "node_modules/vitest")
    }
  },
  server: {
    fs: {
      allow: ["../.."]
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "../../tests/web/**/*.test.ts", "../../tests/web/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"]
  }
});
