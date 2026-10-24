/**
 * `pnpm new <name>` writes src/components/ui/<name>.tsx and
 * src/components/ui/<name>.showcase.tsx from the templates below. It refuses
 * to overwrite either file.
 */
import { existsSync, writeFileSync } from "node:fs"

const name = process.argv[2] ?? ""
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error("Usage: pnpm new <name>, where <name> is kebab-case, such as tag-input.")
  process.exit(1)
}

const pascal = name
  .split("-")
  .map((word) => word[0].toUpperCase() + word.slice(1))
  .join("")
const title = name
  .split("-")
  .map((word) => word[0].toUpperCase() + word.slice(1))
  .join(" ")

const component = `import * as React from "react"

import { cn } from "@/lib/utils"

export type ${pascal}Props = React.HTMLAttributes<HTMLDivElement>

const ${pascal} = React.forwardRef<HTMLDivElement, ${pascal}Props>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card p-4 text-card-foreground", className)} {...props} />
))
${pascal}.displayName = "${pascal}"

export { ${pascal} }
`

const showcase = `import type { Showcase } from "@/catalog/types"
import { ${pascal} } from "@/components/ui/${name}"

export default {
  title: "${title}",
  group: "Layout",
  description: "Say what ${title} is for in one or two plain sentences.",
  examples: {
    Default: () => <${pascal}>${title}</${pascal}>,
  },
} satisfies Showcase
`

const files = {
  [`src/components/ui/${name}.tsx`]: component,
  [`src/components/ui/${name}.showcase.tsx`]: showcase,
}

const taken = Object.keys(files).filter((path) => existsSync(path))
if (taken.length) {
  console.error(`Not overwriting: ${taken.join(", ")}`)
  process.exit(1)
}
for (const [path, text] of Object.entries(files)) {
  writeFileSync(path, text, { flag: "wx" })
  console.log(`created ${path}`)
}
console.log(`Open /components/${name} in the dev server to see it.`)
