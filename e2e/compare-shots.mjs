// Before-and-after check: takes the reference shots of plan 1's standalone preview from this site's preview route
// and compares them pixel by pixel. Usage: node e2e/compare-shots.mjs [baseUrl]   (default http://localhost:4317)
// Needs the site served (`pnpm build && pnpm preview --port 4317`) and the reference folder, which is not in the repo.
// The manifest's `steps` are the replayable language described in the header of the reference's take-shots.mjs.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'

const REF = process.env.REF_DIR ?? '.superpowers/ref/plan1-shots'
const OUT = 'e2e/shots/compare'
const TOLERANCE = 2 // per channel
const LIMIT = 1 // percent of pixels
const EXTRA_LIMIT = { 'photo-print-small-mat--neutral': 3 } // not byte-stable between two runs of the reference itself
const base = (process.argv[2] ?? 'http://localhost:4317').replace(/\/$/, '')

const stop = (message) => {
  console.error(message)
  process.exit(2)
}
if (!existsSync(join(REF, 'manifest.json'))) {
  stop(`No reference shots at ${REF}/manifest.json. They are taken from a build of the plan-1-foundation branch with the standalone take-shots script (not in this repo); set REF_DIR to a folder that holds manifest.json and the PNGs.`)
}
let manifest
try {
  manifest = JSON.parse(readFileSync(join(REF, 'manifest.json'), 'utf8'))
} catch (error) {
  stop(`${REF}/manifest.json is not valid JSON: ${error.message}`)
}
if (!Array.isArray(manifest.shots)) stop(`${REF}/manifest.json has no "shots" list.`)

/** The shots the comparison must cover: every piece in every look, plus the open and variant states. */
const LOOKS = ['wecuratelife', 'urlovematters', 'neutral']
const PIECES = ['button', 'text-link', 'eyebrow', 'chips', 'input', 'textarea', 'phone-input', 'select', 'photo', 'modal']
const STATES = [
  'select-open-line', 'select-open-box', 'modal-open',
  'input-box', 'textarea-box', 'select-box', 'phone-input-box',
  'photo-plain', 'photo-print', 'photo-mat', 'photo-cameo', 'photo-arch', 'photo-print-white-mat', 'photo-print-small-mat',
]
const expected = LOOKS.flatMap((look) => [...PIECES, ...STATES].map((name) => `${name}--${look}`))
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null
const have = new Set(manifest.shots.map((shot) => shot.name))
const absent = expected.filter((name) => !have.has(name))
if (absent.length) stop(`The manifest lacks ${absent.length} of the ${expected.length} expected shots, for example ${absent.slice(0, 3).join(', ')}.`)

const urlFor = (s) => {
  const q = new URLSearchParams({ look: s.theme })
  if (Object.keys(s.props).length) q.set('p', Buffer.from(JSON.stringify(s.props)).toString('base64url'))
  return `${base}/client/preview/${s.id}?${q}`
}

async function run(page, s) {
  let png
  for (const step of s.steps) {
    switch (step.action) {
      case 'goto':
        await page.goto(urlFor(s), { waitUntil: 'load' })
        // Chromium sometimes never reports networkidle on a page with a framed image although nothing is pending, so
        // the wait is bounded and a miss is not an error; the piece is awaited directly, then the manifest's own
        // font and image steps follow.
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined)
        await page.locator('.ds-root').first().waitFor({ state: 'visible' })
        break
      case 'waitForFonts': await page.evaluate(() => document.fonts.ready.then(() => undefined)); break
      case 'waitForImages':
        await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0))
        break
      case 'click': await page.locator(step.selector).first().click(); break
      case 'waitForVisible': await page.locator(step.selector).first().waitFor({ state: 'visible' }); break
      case 'mouseMove': await page.mouse.move(step.x, step.y); break
      case 'settle':
        await page.waitForTimeout(step.ms)
        await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))).then(() => undefined))
        break
      case 'screenshot': png = await page.screenshot({ fullPage: step.fullPage }); break
      default: throw new Error(`unknown step ${step.action}`)
    }
  }
  return png
}

function compare(a, b) {
  if (a.width !== b.width || a.height !== b.height) return { percent: 100, diff: null, note: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` }
  const diff = new PNG({ width: a.width, height: a.height })
  let count = 0
  for (let i = 0; i < a.data.length; i += 4) {
    const bad = [0, 1, 2, 3].some((c) => Math.abs(a.data[i + c] - b.data[i + c]) > TOLERANCE)
    if (bad) count++
    diff.data.set(bad ? [255, 0, 0, 255] : [b.data[i] >> 1, b.data[i + 1] >> 1, b.data[i + 2] >> 1, 255], i)
  }
  return { percent: (count / (a.width * a.height)) * 100, diff }
}

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const rows = []
for (const s of manifest.shots) {
  if (only && !only.test(s.name)) continue
  const limit = EXTRA_LIMIT[s.name] ?? LIMIT
  let context
  try {
    context = await browser.newContext({ viewport: { width: s.viewport.width, height: s.viewport.height }, deviceScaleFactor: s.viewport.deviceScaleFactor })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    const now = PNG.sync.read(await run(page, s))
    const ref = PNG.sync.read(readFileSync(join(REF, `${s.name}.png`)))
    const { percent, diff, note } = compare(ref, now)
    const ok = percent <= limit && errors.length === 0
    if (!ok) {
      writeFileSync(join(OUT, `${s.name}.now.png`), PNG.sync.write(now))
      if (diff) writeFileSync(join(OUT, `${s.name}.diff.png`), PNG.sync.write(diff))
    }
    rows.push({ name: s.name, percent, limit, ok, note: [note, ...errors].filter(Boolean).join('; ') })
  } catch (error) {
    rows.push({ name: s.name, percent: NaN, limit, ok: false, note: `error: ${String(error.message ?? error).split('\n')[0]}` })
  } finally {
    await context?.close()
  }
}
await browser.close()

if (rows.length === 0) stop('No shot was compared (the ONLY pattern matched nothing).')
if (!only && rows.length !== manifest.shots.length) stop(`Compared ${rows.length} of ${manifest.shots.length} shots.`)
const width = Math.max(...rows.map((r) => r.name.length))
for (const r of rows) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name.padEnd(width)} ${Number.isNaN(r.percent) ? '     n/a' : r.percent.toFixed(3).padStart(8)}%  (limit ${r.limit}%)${r.note ? '  ' + r.note : ''}`)
const failed = rows.filter((r) => !r.ok)
console.log(`\n${rows.length - failed.length} of ${rows.length} shots within tolerance`)
process.exit(failed.length ? 1 : 0)
