import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseClientMeta } from './parseMeta'

const root = join(import.meta.dirname, '..', '..', '..')

describe('parseClientMeta', () => {
  it.each(['files', 'dependencies', 'registryDependencies'])('rejects %s written as a method, naming it', (field) => {
    const source = `export default defineMeta({ id: 'a', name: 'A', summary: 's', files: ['a.tsx'], ${field}() { return ['x'] } })`
    // a duplicate of `files` would be caught as listed twice; the method form must be caught first
    const only = field === 'files' ? source.replace("files: ['a.tsx'], ", '') : source
    expect(() => parseClientMeta(only, 'a.meta.ts')).toThrow(new RegExp(`a\\.meta\\.ts: "${field}" is written as a method`))
  })

  it('still ignores a method that is not a registry field', () => {
    const source = `export default defineMeta({ id: 'a', name: 'A', summary: 's', files: ['a.tsx'], render() { return null } })`
    expect(parseClientMeta(source).files).toEqual(['a.tsx'])
  })

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
      name: 'Thing',
      summary: 'A thing.',
      files: ['a.tsx', 'a.css', 'a.meta.ts'],
      dependencies: ['clsx'],
      registryDependencies: ['input', 'base'],
    })
  })

  it('treats missing optional fields as empty arrays', () => {
    const got = parseClientMeta(`export default defineMeta({ id: 'x', name: 'X', summary: 's', files: [] })`)
    expect(got.dependencies).toEqual([])
    expect(got.registryDependencies).toEqual([])
  })

  it.each([
    ['files', `files: FILES,`],
    ['dependencies', `files: [], dependencies,`],
    ['registryDependencies', `files: [], registryDependencies,`],
    ['files', `files,`],
    ['\\[\'files\'\\]', `['files']: [],`],
    ['\\[key\\]', `[key]: 'x', files: [],`],
    ['\\.\\.\\.spread', `files: [], ...rest,`],
    ['files', `files: [], files: ['a'],`],
    ['name', `files: [], name: 'Y',`],
    ['name', `files: [], name: NAME,`],
    ['files', `files: ['a.ts', FILE],`],
    ['files', `files: ['a'].concat(['b']),`],
    ['summary', `files: [], summary: 'a' + 'b',`],
    ['dependencies', `files: [], dependencies: deps,`],
    ['registryDependencies', `files: [], registryDependencies: [\`x\${y}\`],`],
  ])('throws naming the file and "%s" when it is not a plain literal', (field, body) => {
    const source = `export default defineMeta({ id: 'x', name: 'X', summary: 's', ${body} })`
    expect(() => parseClientMeta(source, 'x.meta.ts')).toThrow(new RegExp(`x\\.meta\\.ts: "${field}"`))
  })

  it('reads through satisfies, as, parentheses and a trivial const', () => {
    const body = `{ id: 'x', name: 'X', summary: 's', files: ['a'] as const }`
    for (const source of [
      `export default defineMeta(${body} satisfies Foo)`,
      `export default (defineMeta(${body}) as Foo)`,
      `const m = defineMeta(${body})\nexport default m`,
    ]) expect(parseClientMeta(source).files).toEqual(['a'])
  })

  it('says what form is expected when the default export is something else', () => {
    expect(() => parseClientMeta(`const m = make()\nexport default m`, 'm.ts')).toThrow(/m\.ts: expected `export default defineMeta/)
  })

  it('throws on a missing required field and on a missing default export', () => {
    expect(() => parseClientMeta(`export default defineMeta({ id: 'x', name: 'X', files: [] })`, 'm.ts')).toThrow(/"summary" is missing/)
    expect(() => parseClientMeta(`export default defineMeta({ id: 'x', summary: 's', files: [] })`, 'm.ts')).toThrow(/"name" is missing/)
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
