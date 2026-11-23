import type { ComponentType } from 'react'
import type { ThemeId } from '@/client/tokens/contract'

export type Control =
  | { type: 'text'; label: string }
  | { type: 'boolean'; label: string }
  | { type: 'select'; label: string; options: readonly string[] }
  | { type: 'number'; label: string; min: number; max: number; step?: number }
  | { type: 'list'; label: string } // string[]

export type Group = 'primitives' | 'layout' | 'motion' | 'sections' | 'galleries' | 'set-pieces'
export type Origin = 'wecuratelife' | 'urlovematters'

export interface ComponentMeta<P extends object> {
  /** kebab-case; equals folder name and registry item name */
  id: string
  /** display name */
  name: string
  group: Group
  origin: readonly Origin[]
  /** https URL on the live client site */
  seenOn?: string
  /** one sentence */
  summary: string
  component: ComponentType<P>
  /** catalog only: what the previews draw in place of `component`, for a piece that only arranges its children
   *  and so shows nothing by itself (the layout pieces). It takes the same props */
  demo?: ComponentType<P>
  defaults: P
  controls: Partial<Record<keyof P, Control>>
  layout: 'centered' | 'full' | 'scroll'
  /** catalog only: width in px the piece gets in a `centered` preview and on its home card (block-level form
   *  fields, which otherwise shrink to their content); capped at the space available */
  previewWidth?: number
  /** catalog only: props laid over `defaults` for the small live piece on the home card (e.g. a smaller photo) */
  cardProps?: Partial<P>
  homeTheme: ThemeId
  /** repo-relative, e.g. 'src/client/components/button/Button.tsx' */
  files: readonly string[]
  /** npm packages */
  dependencies?: readonly string[]
  /** other component ids, or 'base' */
  registryDependencies?: readonly string[]
  /** JSX snippet shown in the Code tab */
  usage: string
}

export function defineMeta<P extends object>(m: ComponentMeta<P>): ComponentMeta<P> {
  return m
}
