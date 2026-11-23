import { useEffect } from "react"

import site from "@/site.config"

export function useTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} · ${site.name}` : site.name
  }, [page])
}
