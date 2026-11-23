import { expect, test, type Page } from "@playwright/test"

// Rendered checks for details unit tests cannot see (jsdom has no layout or stylesheet cascade).
const p = (props: object) => Buffer.from(JSON.stringify(props)).toString("base64url")
const open = (page: Page, id: string, look: string, props?: object) =>
  page.goto(`client/preview/${id}?look=${look}${props ? `&p=${p(props)}` : ""}`)

test.describe("polish", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1000, "desktop only")

  test("ur love matters filled buttons are borderless and 52px tall, as live; We Curate Life keeps its 1px border", async ({ page }) => {
    for (const variant of ["primary", "secondary"]) {
      await open(page, "button", "urlovematters", { variant })
      const ulm = await page.locator(".ds-button").evaluate((el) => ({
        border: getComputedStyle(el).borderTopWidth,
        height: el.getBoundingClientRect().height,
      }))
      expect(ulm.border, variant).toBe("0px")
      expect(ulm.height, variant).toBeCloseTo(52.02, 0)
    }
    await open(page, "button", "wecuratelife")
    const wcl = await page.locator(".ds-button").evaluate((el) => ({
      border: getComputedStyle(el).borderTopWidth,
      height: el.getBoundingClientRect().height,
    }))
    expect(wcl.border).toBe("1px")
    expect(wcl.height).toBeCloseTo(44.39, 0)
  })

  test("the line textarea has no resize grip; the boxed one resizes vertically", async ({ page }) => {
    await open(page, "textarea", "wecuratelife", { variant: "line" })
    await expect(page.locator(".ds-textarea")).toHaveCSS("resize", "none")
    await open(page, "textarea", "urlovematters", { variant: "box" })
    await expect(page.locator(".ds-textarea")).toHaveCSS("resize", "vertical")
  })

  test("form fields get about 360px in a centered preview", async ({ page }) => {
    for (const id of ["input", "textarea", "phone-input", "select"]) {
      await open(page, id, "wecuratelife")
      const width = await page.locator("[data-preview-fit]").evaluate((el) => el.getBoundingClientRect().width)
      expect(width, id).toBeCloseTo(360, 0)
    }
  })

  test("a long Select list scrolls inside its panel, and keyboard focus shows a line on the option", async ({ page }) => {
    const options = Array.from({ length: 30 }, (_, i) => `Option ${i + 1}`)
    await open(page, "select", "wecuratelife", { options })
    await page.locator(".ds-select__button").focus()
    await page.keyboard.press("ArrowDown")
    const panel = page.locator(".ds-select__panel")
    await expect(panel).toBeVisible()
    const box = await panel.evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight, overflow: getComputedStyle(el).overflowY }))
    expect(box.overflow).toBe("auto")
    expect(box.client).toBeLessThanOrEqual(288)
    expect(box.scroll).toBeGreaterThan(box.client)
    await page.keyboard.press("ArrowDown")
    const focused = page.locator(".ds-select__option:focus")
    await expect(focused).toHaveText("Option 2")
    expect(await focused.evaluate((el) => getComputedStyle(el).boxShadow)).toMatch(/inset/)
    // the last option can be reached and is scrolled into view inside the panel
    await page.keyboard.press("End")
    await expect(page.locator(".ds-select__option:focus")).toHaveText("Option 30")
    await expect(page.locator(".ds-select__option:focus")).toBeInViewport()
  })
})

test("client index cards: every live piece fits inside its card", async ({ page }) => {
  await page.goto("client")
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => undefined) // see smoke.spec.ts
  await page.evaluate(() => document.fonts.ready)
  const overflowing = await page.locator("[data-card-view]").evaluateAll((views) =>
    views.flatMap((view) => {
      const frame = view.getBoundingClientRect()
      const piece = view.querySelector(".ds-root")
      if (!piece) return []
      const r = (piece.firstElementChild ?? piece).getBoundingClientRect()
      const out = r.left < frame.left - 1 || r.right > frame.right + 1 || r.top < frame.top - 1 || r.bottom > frame.bottom + 1
      return out ? [view.parentElement?.textContent?.slice(0, 40) ?? "?"] : []
    }),
  )
  expect(overflowing).toEqual([])
})

test("a tall piece is shown whole in its page's preview frame (the Photo is not clipped)", async ({ page }) => {
  await page.goto("client/photo?look=wecuratelife")
  const frame = page.frameLocator("iframe")
  await expect(frame.locator(".ds-photo").first()).toBeVisible()
  // the image itself loaded (the frame must not just be tall around an empty well)
  await expect
    .poll(() => frame.locator(".ds-photo img").first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true)
  // The frame grows to the height the piece reports, so give the report a moment to land.
  await expect
    .poll(async () => {
      const piece = await frame.locator(".ds-photo").first().boundingBox()
      const clip = await page.locator("iframe").evaluate((el) => el.parentElement!.getBoundingClientRect().height)
      const framed = await page.locator("iframe").boundingBox()
      return piece && framed ? Math.round(clip - (piece.y + piece.height - framed.y + 1)) >= 0 : false
    })
    .toBe(true)
})
