import { describe, expect, it } from 'vitest'
import { defineMeta } from './meta'
import { decodeState, encodeState, type PreviewState } from './state'
import button from '@/client/components/button/button.meta'

const b64 = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const p = (obj: unknown) => `p=${b64(JSON.stringify(obj))}`

const fixture = defineMeta<{ tags: string[]; count: number; on: boolean; label: string; gone?: string; kind: string; secret: string }>({
  id: 'fixture',
  name: 'Fixture',
  group: 'primitives',
  origin: ['wecuratelife'],
  summary: 'fixture',
  component: () => null,
  defaults: { tags: ['a'], count: 3, on: false, label: 'Hi', kind: 'a', secret: 'keep' },
  controls: {
    tags: { type: 'list', label: 'Tags' },
    count: { type: 'number', label: 'Count', min: 1, max: 10 },
    on: { type: 'boolean', label: 'On' },
    label: { type: 'text', label: 'Label' },
    kind: { type: 'select', label: 'Kind', options: ['a', 'b'] },
  },
  layout: 'centered',
  homeTheme: 'urlovematters',
  files: [],
  usage: '',
})

describe('state', () => {
  it('encodes defaults as exactly the look', () => {
    expect(encodeState(button, { theme: 'urlovematters', props: { ...button.defaults } })).toBe('look=urlovematters')
  })

  it('round-trips changed props on the button', () => {
    const s: PreviewState = { theme: 'urlovematters', props: { ...button.defaults, variant: 'outline', hover: 'wipe' } }
    expect(decodeState(button, encodeState(button, s))).toEqual(s)
  })

  it('round-trips list, number, boolean and non-ASCII text', () => {
    const s: PreviewState = {
      theme: 'urlovematters',
      props: { tags: ['x', 'y z', 'é'], count: 9, on: true, label: 'Réserver ✓', kind: 'b', secret: 'keep' },
    }
    const qs = encodeState(fixture, s)
    expect(qs.split('p=')[1]).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeState(fixture, `?${qs}`)).toEqual(s)
  })

  it('only encodes props that differ', () => {
    const qs = encodeState(fixture, { theme: 'urlovematters', props: { ...fixture.defaults, count: 4 } })
    const raw = new URLSearchParams(qs).get('p')!
    expect(JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/')))).toEqual({ count: 4 })
  })

  it('reads the look from `look`, not from the site theme parameter', () => {
    expect(decodeState(button, 'look=neutral').theme).toBe('neutral')
    expect(decodeState(button, 'theme=neutral').theme).toBe('urlovematters')
    expect(decodeState(button, 'theme=midnight&look=wecuratelife').theme).toBe('wecuratelife')
  })

  it('falls back to homeTheme for an unknown look', () => {
    expect(decodeState(button, 'look=bogus').theme).toBe('urlovematters')
  })

  it('drops unknown keys, wrong types and bad list items', () => {
    expect(decodeState(button, p({ evil: 'x', variant: 'outline' })).props).toEqual({ ...button.defaults, variant: 'outline' })
    expect(decodeState(button, p({ variant: 5 })).props).toEqual(button.defaults)
    expect(decodeState(fixture, p({ tags: [1] })).props).toEqual(fixture.defaults)
    expect(decodeState(fixture, p({ tags: 'a' })).props).toEqual(fixture.defaults)
    expect(decodeState(fixture, p({ count: 'x', on: 1 })).props).toEqual(fixture.defaults)
  })

  it('does not accept props with no default, or prototype keys', () => {
    expect(decodeState(fixture, p({ gone: 'x' })).props).toEqual(fixture.defaults)
    const s = decodeState(fixture, `p=${b64('{"__proto__":{"x":1},"constructor":"y"}')}`)
    expect(s.props).toEqual(fixture.defaults)
    expect(({} as Record<string, unknown>).x).toBeUndefined()
  })

  it.each([
    ['malformed percent-encoding', 'p=%%%'],
    ['bare percent', '%'],
    ['invalid base64', 'p=!!!!'],
    ['base64 of non-JSON', `p=${b64('not json')}`],
    ['invalid UTF-8', 'p=_w'],
    ['JSON array', p([1, 2])],
    ['JSON null', p(null)],
    ['JSON number', p(7)],
    ['JSON string', p('x')],
    ['empty', ''],
  ])('never throws and returns defaults for %s', (_n, search) => {
    expect(decodeState(button, search)).toEqual({ theme: 'urlovematters', props: button.defaults })
  })

  it('applies a valid look even when p is broken', () => {
    expect(decodeState(button, 'look=neutral&p=%%%').theme).toBe('neutral')
  })

  describe('hardening', () => {
    const d = fixture.defaults
    it('ignores props without a control', () => {
      expect(decodeState(fixture, p({ secret: 'x' })).props).toEqual(d)
    })
    it('requires select values to be listed options', () => {
      expect(decodeState(button, p({ variant: 'zzz' })).props).toEqual(button.defaults)
      expect(decodeState(fixture, p({ kind: 'b' })).props.kind).toBe('b')
      expect(decodeState(fixture, p({ kind: 'c' })).props.kind).toBe('a')
    })
    it('requires numbers within min and max', () => {
      expect(decodeState(fixture, p({ count: 10 })).props.count).toBe(10)
      expect(decodeState(fixture, p({ count: 11 })).props.count).toBe(3)
      expect(decodeState(fixture, p({ count: 0 })).props.count).toBe(3)
    })
    it.each(['JaVaScRiPt:alert(1)', ' java\nscript:alert(1)', 'java\tscr\u0000ipt:x', 'data:text/html,x', 'vbscript:x'])(
      'rejects script scheme in text %j and list items',
      (bad) => {
        expect(decodeState(fixture, p({ label: bad })).props.label).toBe('Hi')
        expect(decodeState(fixture, p({ tags: ['ok', bad] })).props.tags).toEqual(['a'])
      },
    )
    it('allows ordinary text that merely mentions a scheme', () => {
      expect(decodeState(fixture, p({ label: 'about javascript: a talk' })).props.label).toBe('about javascript: a talk')
    })
    it('caps text length and list size', () => {
      expect(decodeState(fixture, p({ label: 'x'.repeat(2000) })).props.label).toBe('x'.repeat(2000))
      expect(decodeState(fixture, p({ label: 'x'.repeat(2001) })).props.label).toBe('Hi')
      expect(decodeState(fixture, p({ tags: Array(200).fill('t') })).props.tags).toHaveLength(200)
      expect(decodeState(fixture, p({ tags: Array(201).fill('t') })).props.tags).toEqual(['a'])
    })
    it('ignores an over-long p', () => {
      const long = p({ label: 'x'.repeat(1500), count: 5 })
      expect(decodeState(fixture, long).props.count).toBe(5)
      const over = `p=${'A'.repeat(20001)}`
      expect(decodeState(fixture, `look=urlovematters&${over}`).props).toEqual(d)
      expect(decodeState(fixture, p({ count: 5, label: 'x'.repeat(15000) })).props).toEqual(d)
    })
  })
})
