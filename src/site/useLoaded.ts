import { useEffect, useState } from "react"

export type Loaded<T> = { state: "loading" } | { state: "ready"; value: T } | { state: "failed" }

/** Runs `load` once per function it is given; with no function, the fallback is ready at once. */
export function useLoaded<T>(load: (() => Promise<T>) | undefined, fallback: T): Loaded<T> {
  const [result, setResult] = useState<Loaded<T>>(load ? { state: "loading" } : { state: "ready", value: fallback })
  useEffect(() => {
    if (!load) return
    let live = true
    load().then(
      (value) => live && setResult({ state: "ready", value }),
      () => live && setResult({ state: "failed" }),
    )
    return () => {
      live = false
    }
  }, [load])
  return result
}
