import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: path.resolve(__dirname, "../.vitest-client"),
  resolve: {
    alias: {
      "@red-tetris/shared": path.resolve(__dirname, "../shared/src/index.ts"),
      "./board": path.resolve(__dirname, "../shared/src/board.ts"),
      "./engine": path.resolve(__dirname, "../shared/src/engine.ts"),
      "./tetrominoes": path.resolve(__dirname, "../shared/src/tetrominoes.ts"),
      "./types": path.resolve(__dirname, "../shared/src/types.ts"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/store/**/*.ts"],
      exclude: ["src/**/*.d.ts"],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 50,
      },
    },
  },
});
