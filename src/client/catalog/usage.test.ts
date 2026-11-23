import { describe, expect, it } from 'vitest'
import { allMeta } from '@/client/catalog/registry'

// what each shipped component module really exports, keyed by its repo path without extension
const modules = import.meta.glob<Record<string, unknown>>(['../components/*/*.tsx', '!../components/*/*.test.tsx'], { eager: true })
const exportsOf = (path: string) => modules[`../${path.replace(/^src\/client\//, '')}.tsx`]

describe('usage snippets', () => {
  it.each(allMeta.map((m) => [m.id, m] as const))('%s imports what it uses from the shipped files', (_id, m) => {
    const imports = [...m.usage.matchAll(/^import \{ ([^}]+) \} from '([^']+)'$/gm)]
    const local = imports.filter(([, , from]) => from!.startsWith('./client/components/'))
    expect(local.length, 'imports at least one component').toBeGreaterThan(0)
    for (const [line, names, from] of local) {
      const path = from!.replace(/^\.\//, 'src/')
      const mod = exportsOf(path)
      expect(mod, `${line}: no such file`).toBeDefined()
      for (const name of names!.split(',').map((n) => n.trim())) expect(mod, `${line}: ${name} is not exported`).toHaveProperty(name)
    }
    // every capitalised JSX tag in the snippet is imported
    const imported = new Set(imports.flatMap(([, names]) => names!.split(',').map((n) => n.trim())))
    for (const [, tag] of m.usage.matchAll(/<([A-Z]\w*)/g)) expect(imported, `<${tag}> is not imported`).toContain(tag)
  })

  it('the component a meta ships is the one its snippet imports from its own folder', () => {
    for (const m of allMeta) expect(m.usage).toMatch(new RegExp(`from '\\./client/components/${m.id}/`))
  })
})
