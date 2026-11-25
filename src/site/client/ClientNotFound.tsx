import { Link, useParams } from "react-router-dom"

import { useTitle } from "../useTitle"
import { missingPiece } from "./model"

interface ClientNotFoundProps {
  /** What was missing. Defaults to the piece named in the address, or a generic line. */
  message?: string
  /** Inside the preview frame: the message alone, no link out of the frame. */
  bare?: boolean
}

export default function ClientNotFound({ message, bare = false }: ClientNotFoundProps) {
  const { id } = useParams()
  useTitle("Not found")
  const text = message ?? missingPiece(id)
  if (bare) {
    return (
      <div data-ready="" className="grid min-h-screen place-items-center p-8 text-center">
        <h1 className="text-lg font-medium">{text}</h1>
      </div>
    )
  }
  return (
    <div data-ready="" className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{text}</h1>
      <p className="mt-3 text-muted-foreground">The address may be mistyped, or the piece was renamed.</p>
      <Link to="/client" className="mt-6 inline-block font-medium text-primary underline-offset-4 hover:underline">
        See all client work
      </Link>
    </div>
  )
}
