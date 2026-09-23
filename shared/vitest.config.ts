import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "./board": path.resolve(__dirname, "src/board.ts"),
      "./engine": path.resolve(__dirname, "src/engine.ts"),
      "./tetrominoes": path.resolve(__dirname, "src/tetrominoes.ts"),
      "./types": path.resolve(__dirname, "src/types.ts"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/**/__tests__/**"],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 50,
      },
    },
  },
});
