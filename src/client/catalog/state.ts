import type { ComponentMeta, Control } from './meta'
import { isThemeId, type ThemeId } from '@/client/tokens/contract'

export interface PreviewState {
  theme: ThemeId
  props: Record<string, unknown>
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Throws on invalid base64 or invalid UTF-8; callers catch. */
function fromBase64Url(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k)

/** True when `value` may stand in for `fallback`: same typeof, arrays of strings for lists. */
function accepts(fallback: unknown, value: unknown): boolean {
  if (fallback === undefined || fallback === null) return false
  if (Array.isArray(fallback)) return isStringArray(value)
  const t = typeof fallback
  if (t !== 'string' && t !== 'number' && t !== 'boolean') return false
  if (typeof value !== t) return false
  return t !== 'number' || Number.isFinite(value)
}

const MAX_P_LENGTH = 20000
const MAX_TEXT_LENGTH = 2000
const MAX_LIST_ITEMS = 200
const UNSAFE_SCHEME = /^(javascript|data|vbscript):/i

/** True for strings that could smuggle a script URL into an href/src once whitespace and control chars are stripped. */
function isSafeText(s: string): boolean {
  if (s.length > MAX_TEXT_LENGTH) return false
  // eslint-disable-next-line no-control-regex
  return !UNSAFE_SCHEME.test(s.replace(/[\x00-\x20\x7f]/g, ''))
}

/** Control-specific limits applied after the typeof check. */
function allowedByControl(control: Control, value: unknown): boolean {
  switch (control.type) {
    case 'select':
      return typeof value === 'string' && control.options.includes(value)
    case 'number':
      return typeof value === 'number' && value >= control.min && value <= control.max
    case 'text':
      return typeof value === 'string' && isSafeText(value)
    case 'list':
      return Array.isArray(value) && value.length <= MAX_LIST_ITEMS && value.every((v) => typeof v === 'string' && isSafeText(v))
    default:
      return true
  }
}

export function encodeState<P extends object>(meta: ComponentMeta<P>, state: PreviewState): string {
  const defaults = meta.defaults as Record<string, unknown>
  const changed: Record<string, unknown> = {}
  for (const key of Object.keys(defaults)) {
    if (!own(state.props, key)) continue
    const v = state.props[key]
    if (v === undefined || JSON.stringify(v) === JSON.stringify(defaults[key])) continue
    changed[key] = v
  }
  const params = new URLSearchParams({ theme: state.theme })
  if (Object.keys(changed).length > 0) params.set('p', toBase64Url(JSON.stringify(changed)))
  return params.toString()
}

/** Never throws: anything unusable falls back to the meta's home theme and defaults. */
export function decodeState<P extends object>(meta: ComponentMeta<P>, search: string): PreviewState {
  const defaults = meta.defaults as Record<string, unknown>
  const state: PreviewState = { theme: meta.homeTheme, props: { ...defaults } }
  try {
    const params = new URLSearchParams(search)
    const theme = params.get('theme')
    if (isThemeId(theme)) state.theme = theme
    const raw = params.get('p')
    if (!raw || raw.length > MAX_P_LENGTH) return state
    const parsed: unknown = JSON.parse(fromBase64Url(raw))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return state
    for (const key of Object.keys(parsed)) {
      const value = (parsed as Record<string, unknown>)[key]
      const control = own(meta.controls, key) ? (meta.controls as Record<string, Control | undefined>)[key] : undefined
      if (control && own(defaults, key) && accepts(defaults[key], value) && allowedByControl(control, value)) {
        state.props[key] = value
      }
    }
  } catch {
    // malformed input: keep whatever was applied before the failure
  }
  return state
}
