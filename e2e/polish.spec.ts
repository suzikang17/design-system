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

test.describe("the playground", () => {
  const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url")
  const pieces = (page: Page) =>
    page
      .frameLocator('iframe[title="Your page"]')
      .locator("[data-item]")
      .evaluateAll((rows) => rows.map((row) => row.querySelector("[class^='ds-']")?.className.split(" ")[0]))

  test("starts from a whole small page, with nothing spilling sideways inside the device", async ({ page }) => {
    await page.goto("client/playground")
    const frame = page.frameLocator('iframe[title="Your page"]')
    await expect(frame.locator("[data-item]").first()).toBeVisible()
    expect((await pieces(page)).length).toBeGreaterThanOrEqual(5)
    const overflow = await frame.locator("body").evaluate(() => ({ s: document.documentElement.scrollWidth, w: window.innerWidth }))
    expect(overflow.s, `page scrollWidth ${overflow.s} > innerWidth ${overflow.w}`).toBeLessThanOrEqual(overflow.w)
  })

  test("a piece is dragged from the tray onto the page, dragged to another place, and the link carries the result", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "dragging with a mouse; touch screens use the buttons, tested below")
    await page.goto(`client/playground?page=${b64([["chips"], ["button"]])}`)
    const frame = page.frameLocator('iframe[title="Your page"]')
    await expect(frame.locator("[data-item]")).toHaveCount(2)

    await page.getByRole("button", { name: "Add Eyebrow" }).dragTo(frame.locator("[data-item]").first(), { targetPosition: { x: 120, y: 4 } })
    await expect.poll(() => pieces(page)).toEqual(["ds-eyebrow", "ds-chips", "ds-button"])

    await frame.locator("[data-item]").nth(2).hover()
    await frame.locator("[data-item]").nth(2).locator("[title='Drag to move']").dragTo(frame.locator("[data-item]").first(), { targetPosition: { x: 120, y: 4 } })
    await expect.poll(() => pieces(page)).toEqual(["ds-button", "ds-eyebrow", "ds-chips"])

    await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe(b64([["button"], ["eyebrow"], ["chips"]]))
    await page.reload()
    await expect.poll(() => pieces(page)).toEqual(["ds-button", "ds-eyebrow", "ds-chips"])
  })

  test("without dragging: tap to add, the buttons move and remove, and a click opens the piece's options", async ({ page }) => {
    await page.goto(`client/playground?page=${b64([["chips"], ["button"]])}`)
    const frame = page.frameLocator('iframe[title="Your page"]')
    await page.getByRole("button", { name: "Add Eyebrow" }).click()
    await expect.poll(() => pieces(page)).toEqual(["ds-chips", "ds-button", "ds-eyebrow"])
    await expect(page.getByRole("heading", { name: "Eyebrow options" })).toBeVisible()

    await frame.getByRole("button", { name: "Move Eyebrow up" }).click()
    await expect.poll(() => pieces(page)).toEqual(["ds-chips", "ds-eyebrow", "ds-button"])
    await frame.getByRole("button", { name: "Remove Chips" }).click()
    await expect.poll(() => pieces(page)).toEqual(["ds-eyebrow", "ds-button"])

    await frame.locator(".ds-button").click()
    await expect(page.getByRole("heading", { name: "Button options" })).toBeVisible()
    await page.getByRole("textbox", { name: "Label" }).fill("Book a call")
    await expect(frame.locator(".ds-button")).toHaveText("Book a call")
  })

  test("the client picker restyles the whole page", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "the side nav is behind a menu on phones; the picker itself is tested in unit tests")
    await page.goto(`client/playground?page=${b64([["button"]])}`)
    const root = page.frameLocator('iframe[title="Your page"]').locator(".ds-root")
    await expect(root).toHaveAttribute("data-theme", "wecuratelife")
    await page.getByRole("combobox", { name: "Client" }).click()
    await page.getByRole("option", { name: "ur love matters" }).click()
    await expect(root).toHaveAttribute("data-theme", "urlovematters")
  })
})
