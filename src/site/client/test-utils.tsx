/* eslint-disable react-refresh/only-export-components -- test helpers, never hot-reloaded */
import { configure, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom"
import { vi } from "vitest"

import { getMeta } from "@/client/catalog/registry"
import { App } from "../App"

// The site's pages are lazy: the first page a test file opens waits on its import, which takes longer than the
// default second on a busy machine.
configure({ asyncUtilTimeout: 5000 })

/** Shows the router's current address, for assertions. */
export function LocationProbe() {
  const { pathname, search } = useLocation()
  return <output data-testid="location">{pathname + search}</output>
}

function BackButton() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(-1)}>
      History back
    </button>
  )
}

/** The whole site at `path`, in memory, with a probe of the address and a Back button. */
export function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
      <BackButton />
    </MemoryRouter>,
  )
}

/** What `/r/client-<id>.json` would answer, built from the piece's meta rather than the generated registry. */
function publishedItem(url: string) {
  const name = url.replace(/^.*\/r\//, "").replace(/\.json$/, "")
  const meta = getMeta(name.replace(/^client-/, ""))
  if (!meta) return undefined
  const deps: string[] = ["base", ...((meta.registryDependencies as readonly string[] | undefined) ?? [])]
  return { name, registryDependencies: deps.map((dep) => `http://localhost:4173/r/client-${dep}.json`) }
}

/** Answers registry requests without the network. Returns the mock, to read the requested URLs. */
export function stubRegistry() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const item = publishedItem(String(input))
    return { ok: Boolean(item), status: item ? 200 : 404, headers: new Headers({ "content-type": "application/json" }), json: async () => item }
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

/** The site's page shell scrolls to the top on navigation; jsdom has no scrolling. */
export function stubScrolling() {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined)
}

/** The client picker in the side nav: it decides whose work is on show and the look every piece is drawn in. Its
 *  text is the picked client's name. */
export const clientPicker = () => within(screen.getByRole("navigation", { name: "Client work" })).getByRole("combobox", { name: "Client" })

/** Opens the client picker and chooses the client called `name`. */
export async function pickClient(name: string) {
  await userEvent.click(clientPicker())
  await userEvent.click(await screen.findByRole("option", { name }))
}
