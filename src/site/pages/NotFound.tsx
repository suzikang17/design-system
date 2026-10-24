import { Link } from "react-router-dom"

import { useTitle } from "../useTitle"

export default function NotFound({ what = "page" }: { what?: string }) {
  useTitle("Not found")
  return (
    <div data-ready="" className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">There is no {what} here</h1>
      <p className="mt-3 text-muted-foreground">The address may be mistyped, or the {what} was renamed.</p>
      <Link to="/components" className="mt-6 inline-block font-medium text-primary underline-offset-4 hover:underline">
        Browse all components
      </Link>
    </div>
  )
}
