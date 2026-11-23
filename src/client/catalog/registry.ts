import type { ComponentMeta, Group } from './meta'

/** One meta of any piece. The list mixes prop types, and a ComponentMeta<P> is not assignable to
 *  ComponentMeta<object> (its component takes P), so `any` is the honest element type here. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyMeta = ComponentMeta<any>

export const GROUPS: readonly { id: Group; label: string }[] = [
  { id: 'primitives', label: 'Primitives' },
  { id: 'layout', label: 'Layout' },
  { id: 'motion', label: 'Motion' },
  { id: 'sections', label: 'Sections' },
  { id: 'galleries', label: 'Galleries' },
  { id: 'set-pieces', label: 'Set pieces' },
]

const modules = import.meta.glob<{ default: AnyMeta }>('../components/*/*.meta.ts', { eager: true })

const groupRank = (g: Group) => GROUPS.findIndex((x) => x.id === g)

/** Folder name under src/client/components/ each meta was loaded from. */
const folders = new Map<AnyMeta, string>()

const loaded = Object.entries(modules).map(([path, mod]) => {
  if (!mod.default) throw new Error(`${path} has no default export (expected defineMeta(...))`)
  folders.set(mod.default, path.split('/').at(-2) ?? '')
  return mod.default
})

export const allMeta: readonly AnyMeta[] = loaded.sort((a, b) => groupRank(a.group) - groupRank(b.group) || a.name.localeCompare(b.name))

export function getMeta(id: string): AnyMeta | undefined {
  return allMeta.find((m) => m.id === id)
}

export const folderOf = (m: AnyMeta): string | undefined => folders.get(m)

const COMPONENTS_DIR = 'src/client/components/'

/** Returns human-readable problems with a set of metas; empty means valid. */
export function validateMetas(
  metas: readonly AnyMeta[],
  fileExists: (path: string) => boolean,
  folder: (m: AnyMeta) => string | undefined = () => undefined,
): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const m of metas) {
    if (seen.has(m.id)) problems.push(`duplicate id "${m.id}"`)
    seen.add(m.id)
    const dir = folder(m)
    if (dir !== undefined && dir !== m.id) problems.push(`"${m.id}": meta lives in folder "${dir}", id must equal it`)
    if (m.files.length === 0) problems.push(`"${m.id}": files is empty`)
    for (const file of m.files) {
      if (file.startsWith(COMPONENTS_DIR) && !file.startsWith(`${COMPONENTS_DIR}${m.id}/`)) {
        problems.push(`"${m.id}": file ${file} is not inside ${COMPONENTS_DIR}${m.id}/`)
      }
      if (!fileExists(file)) problems.push(`"${m.id}": file ${file} does not exist`)
    }
    for (const key of Object.keys(m.controls)) {
      if (!(key in (m.defaults as object))) problems.push(`"${m.id}": control "${key}" has no entry in defaults`)
    }
  }
  return problems
}
