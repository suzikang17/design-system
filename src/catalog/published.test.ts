import { afterEach, describe, expect, it, vi } from "vitest"

import { publishedDependencies } from "@/catalog"

const answer = (body: string, type: string, status = 200) =>
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status, headers: { "content-type": type } })))

afterEach(() => vi.unstubAllGlobals())

describe("publishedDependencies", () => {
  it("reads packages and items from the registry item", async () => {
    answer(JSON.stringify({ dependencies: ["clsx", "recharts@^2.12.7"], registryDependencies: ["https://x.example/r/button.json"] }), "application/json")
    expect(await publishedDependencies("chart")).toEqual({
      packages: [{ name: "clsx" }, { name: "recharts", version: "^2.12.7" }],
      items: ["button"],
    })
  })

  it("rejects a missing item that the single-page fallback answered with index.html and 200", async () => {
    answer("<!doctype html><title>x</title>", "text/html; charset=utf-8")
    await expect(publishedDependencies("nope")).rejects.toThrow(/not a registry item/)
  })

  it("rejects a non-200 answer", async () => {
    answer("", "application/json", 404)
    await expect(publishedDependencies("nope")).rejects.toThrow(/404/)
  })
})
