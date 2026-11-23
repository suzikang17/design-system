import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defineMeta } from './meta'
import { allMeta, folderOf, getMeta, validateMetas } from './registry'

const root = join(import.meta.dirname, '..', '..', '..')
const existsOnDisk = (p: string) => existsSync(join(root, p))
const Noop = () => null

const good = defineMeta({
  id: 'thing',
  name: 'Thing',
  group: 'primitives',
  origin: ['urlovematters'],
  summary: 'A thing.',
  component: Noop,
  defaults: { label: 'x' },
  controls: { label: { type: 'text', label: 'Label' } },
  layout: 'centered',
  homeTheme: 'neutral',
  files: ['src/client/catalog/meta.ts'],
  usage: '<Thing />',
})
const withOverrides = (o: Record<string, unknown>) => ({ ...good, ...o }) as typeof good

describe('validateMetas', () => {
  it('passes a valid meta (no problems)', () => {
    // files live outside src/client/components/, so only existence is checked
    expect(validateMetas([good], () => true)).toEqual([])
  })

  it('flags duplicate ids', () => {
    expect(validateMetas([good, good], () => true).join('\n')).toMatch(/duplicate id "thing"/)
  })

  it('flags a file under src/client/components/ that is not in the id folder', () => {
    const m = withOverrides({ files: ['src/client/components/other/Thing.tsx'] })
    expect(validateMetas([m], () => true).join('\n')).toMatch(/not inside src\/client\/components\/thing\//)
  })

  it('flags an id that differs from the folder the meta was loaded from', () => {
    expect(validateMetas([good], () => true, () => 'other').join('\n')).toMatch(/folder "other"/)
    expect(validateMetas([good], () => true, () => 'thing')).toEqual([])
  })

  it('flags an empty files list', () => {
    expect(validateMetas([withOverrides({ files: [] })], () => true).join('\n')).toMatch(/files is empty/)
  })

  it('flags a missing file', () => {
    expect(validateMetas([good], () => false).join('\n')).toMatch(/does not exist/)
  })

  it('flags a controls key that is not in defaults', () => {
    const m = withOverrides({ controls: { nope: { type: 'text', label: 'Nope' } } })
    expect(validateMetas([m], () => true).join('\n')).toMatch(/control "nope"/)
  })
})

describe('registry', () => {
  it('has valid metas on disk', () => {
    expect(validateMetas(allMeta, existsOnDisk, folderOf)).toEqual([])
  })

  it('ids are unique', () => {
    const ids = allMeta.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("getMeta('nope') is undefined", () => {
    expect(getMeta('nope')).toBeUndefined()
  })
})
