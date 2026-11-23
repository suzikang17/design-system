import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseClientMeta } from './parseMeta'

const root = join(import.meta.dirname, '..', '..', '..')

describe('parseClientMeta', () => {
  it('reads the registry fields and ignores the rest', () => {
    const source = `import { defineMeta } from '@/client/catalog/meta'
export default defineMeta({
  id: 'thing',
  name: 'Thing',
  summary: "A thing.",
  component: Thing,
  files: ['a.tsx', 'a.css', 'a.meta.ts'],
  dependencies: ['clsx'],
  registryDependencies: ['input', 'base'],
  usage: \`<Thing />\`,
})`
    expect(parseClientMeta(source)).toEqual({
      id: 'thing',
      summary: 'A thing.',
      files: ['a.tsx', 'a.css', 'a.meta.ts'],
      dependencies: ['clsx'],
      registryDependencies: ['input', 'base'],
    })
  })

  it('treats missing optional fields as empty arrays', () => {
    const got = parseClientMeta(`export default defineMeta({ id: 'x', summary: 's', files: [] })`)
    expect(got.dependencies).toEqual([])
    expect(got.registryDependencies).toEqual([])
  })

  it.each([
    ['files', `files: FILES,`],
    ['files', `files: ['a.ts', FILE],`],
    ['files', `files: ['a'].concat(['b']),`],
    ['summary', `files: [], summary: 'a' + 'b',`],
    ['dependencies', `files: [], dependencies: deps,`],
    ['registryDependencies', `files: [], registryDependencies: [\`x\${y}\`],`],
  ])('throws naming the file and "%s" when it is not a plain literal', (field, body) => {
    const source = `export default defineMeta({ id: 'x', summary: 's', ${body} })`
    expect(() => parseClientMeta(source, 'x.meta.ts')).toThrow(new RegExp(`x\\.meta\\.ts: "${field}"`))
  })

  it('throws on a missing required field and on a missing default export', () => {
    expect(() => parseClientMeta(`export default defineMeta({ id: 'x', files: [] })`, 'm.ts')).toThrow(/"summary" is missing/)
    expect(() => parseClientMeta(`export const x = 1`, 'm.ts')).toThrow(/m\.ts: expected/)
  })

  const dir = join(root, 'src/client/components')
  const metas = readdirSync(dir).map((id) => ({ id, path: join(dir, id, `${id}.meta.ts`) }))

  it.each(metas)('the real $id meta parses, matches its folder, and lists files that exist', ({ id, path }) => {
    const parsed = parseClientMeta(readFileSync(path, 'utf8'), path)
    expect(parsed.id).toBe(id)
    expect(parsed.files.length).toBeGreaterThan(0)
    for (const f of parsed.files) expect(existsSync(join(root, f)), f).toBe(true)
  })
})
