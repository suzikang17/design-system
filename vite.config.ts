/// <reference types="vitest/config" />
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

import { parseShowcaseMeta } from "./src/catalog/parse"

/**
 * `<name>.showcase.tsx?meta` is a module of the showcase's title, group,
 * description, source and license, read from its text. The nav needs only
 * these, so no page carries every showcase's source.
 */
function showcaseMeta(): Plugin {
  return {
    name: "showcase-meta",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith(".showcase.tsx?meta")) return
      const meta = parseShowcaseMeta(await readFile(id.slice(0, -"?meta".length), "utf8"))
      return `export default ${JSON.stringify(meta)}`
    },
  }
}

export default defineConfig({
  plugins: [showcaseMeta(), react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
})
