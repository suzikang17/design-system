/**
 * Writes e2e/ids.json, the lists the browser checks need (client pieces and their home looks, the looks, and one
 * existing component per group), read from the files on disk as text so the specs never import app code.
 * Generated; gitignored. `pnpm e2e` runs this first.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { parseShowcaseMeta } from "../src/catalog/parse"

const root = new URL("..", import.meta.url).pathname
const read = (path: string) => readFileSync(join(root, path), "utf8")

const looks = readdirSync(join(root, "src/client/tokens/themes"))
  .filter((f) => f.endsWith(".css"))
  .map((f) => f.replace(/\.css$/, ""))
  .sort()

const clients = readdirSync(join(root, "src/client/components"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const meta = read(`src/client/components/${d.name}/${d.name}.meta.ts`)
    const homeLook = /homeTheme:\s*'([a-z]+)'/.exec(meta)?.[1]
    if (!homeLook) throw new Error(`${d.name}: no homeTheme found`)
    return { id: d.name, homeLook }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

/** The first showcase (by name) of each group. */
const byGroup = new Map<string, string>()
for (const file of readdirSync(join(root, "src/components/ui")).filter((f) => f.endsWith(".showcase.tsx")).sort()) {
  const group = parseShowcaseMeta(read(`src/components/ui/${file}`)).group
  if (group && !byGroup.has(group)) byGroup.set(group, file.replace(/\.showcase\.tsx$/, ""))
}

writeFileSync(
  join(root, "e2e/ids.json"),
  JSON.stringify({ looks, clients, componentPerGroup: [...byGroup].map(([group, name]) => ({ group, name })) }, null, 2) + "\n",
)
console.log(`e2e/ids.json: ${clients.length} client pieces, ${looks.length} looks, ${byGroup.size} groups`)
