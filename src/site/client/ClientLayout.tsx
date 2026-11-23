import "@/client/tokens/all.css"

import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { CatalogLayout } from "../Layout"
import { ClientNav } from "./ClientNav"

/** The Client work section: the site's catalog layout with this section's nav. */
export default function ClientLayout() {
  useAddressInSync()
  return <CatalogLayout nav={<ClientNav />} title="Client work" browseLabel="Browse client work" />
}

/**
 * The site's theme provider takes `?theme=` out of the address with `history.replaceState`, behind the router's
 * back, once the page has mounted. The router then still holds the old search, and a page that writes its own
 * query (filters, a piece's look and options) would put `theme` back. Once that has happened, hand the router
 * the address as it now stands. A microtask, because the provider's effect runs after this one.
 */
function useAddressInSync() {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    queueMicrotask(() => {
      const address = window.location
      if (address.pathname !== location.pathname) return
      if (!new URLSearchParams(location.search).has("theme") || new URLSearchParams(address.search).has("theme")) return
      navigate({ pathname: address.pathname, search: address.search, hash: address.hash }, { replace: true, state: location.state })
    })
    // Only the first address can carry the site's ?theme=: the provider reads it once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
