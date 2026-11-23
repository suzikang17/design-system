import { readFileSync } from "node:fs"
import { join } from "node:path"
import { screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { allMeta } from "@/client/catalog/registry"
import { THEMES } from "@/client/tokens/contract"
import { needsClient } from "../../../scripts/needs-client"
import { renderAt, stubScrolling } from "./test-utils"
import { CLIENT_PIECES, COMPONENTS_JSON } from "./using"

vi.mock("@/site/highlight", () => ({ highlight: () => new Promise<string>(() => {}) }))

const read = (file: string) => readFileSync(join(import.meta.dirname, "..", "..", "..", file), "utf8")
const add = (item: string) => `npx shadcn@latest add ${window.location.origin}/r/${item}.json`

beforeEach(stubScrolling)
afterEach(() => vi.restoreAllMocks())

async function open() {
  renderAt("/client/using")
  await screen.findByRole("heading", { level: 1, name: "Using these" })
  return screen.getByRole("main").textContent ?? ""
}

describe("Using these", () => {
  it("is in the side nav and walks through the one-time setup", async () => {
    await open()
    expect(within(screen.getByRole("navigation", { name: "Client work" })).getByRole("link", { name: "Using these" })).toHaveAttribute(
      "href",
      "/client/using",
    )
    for (const step of ["Add a components.json", "Add the base and a look", "Import it once and wrap the app", "Add pieces, one command each"]) {
      expect(screen.getByRole("heading", { level: 2, name: new RegExp(step) })).toBeInTheDocument()
    }
    expect(document.title).toBe("Using these · Client work · Design System")
  })

  it("gives the base, every look and every piece its command, from this site's address", async () => {
    await open()
    expect(screen.getByText(add("client-base"))).toBeInTheDocument()
    for (const look of THEMES) expect(screen.getByText(add(`client-look-${look.id}`))).toBeInTheDocument()
    for (const meta of allMeta) expect(screen.getByText(add(`client-${meta.id}`))).toBeInTheDocument()
  })

  it("offers a components.json that parses and points at no Tailwind files", () => {
    const json = JSON.parse(COMPONENTS_JSON)
    expect(json.tsx).toBe(true)
    expect(json.tailwind).toMatchObject({ config: "", css: "" })
  })

  it("shows imports from where the files land, and the path for a Next.js app without src/", async () => {
    const text = await open()
    expect(text).toContain('import { Button } from "@/client/components/button/Button"')
    expect(text).toContain('import "@/client/tokens/base.css"')
    expect(text).toContain('import { Button } from "../client/components/button/Button"')
    expect(screen.getAllByText("@/src/client/components/button/Button").length).toBeGreaterThan(0)
    expect(text).toContain("client:load")
    expect(text).toMatch(/expect node_modules at the project root/)
  })

  it("names exactly the pieces whose shipped files need 'use client'", async () => {
    const detected = allMeta
      .filter((meta) => (meta.files as readonly string[]).some((file) => file.endsWith(".tsx") && needsClient(read(file))))
      .map((meta) => meta.id)
    expect([...CLIENT_PIECES].sort()).toEqual(detected.sort())
    await open()
    const note = screen.getByText(/pieces with state, effects or their own handlers/)
    for (const id of CLIENT_PIECES) expect(note).toHaveTextContent(allMeta.find((meta) => meta.id === id)!.name)
  })

  it("does not grant or imply a licence, and has no em dashes", async () => {
    const text = await open()
    expect(text).not.toMatch(/you (then )?own|yours to keep|licen[cs]e/i)
    expect(text).toMatch(/no package to install or update/)
    expect(text).not.toContain("—")
  })
})
