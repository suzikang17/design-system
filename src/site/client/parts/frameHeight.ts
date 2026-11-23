/** The tallest the frame grows to, in the frame's own pixels, however tall the piece reports itself. */
export const MAX_FRAME_HEIGHT = 1200

/** From the preview to this page: how tall the piece (with its padding) is, in the preview's pixels. */
export type PreviewReport = { type: "ds:height"; height: number }

export function isPreviewReport(data: unknown): data is PreviewReport {
  if (typeof data !== "object" || data === null) return false
  const message = data as { type?: unknown; height?: unknown }
  return message.type === "ds:height" && typeof message.height === "number" && Number.isFinite(message.height) && message.height > 0
}

/**
 * The frame's own height, in its pixels: never less than the layout's minimum (drawn at `scale`), and taller
 * when the piece reports it needs more, up to MAX_FRAME_HEIGHT.
 */
export function frameHeight(minimum: number, scale: number, reported: number | null): number {
  const least = minimum / scale
  if (reported === null) return least
  return Math.max(least, Math.min(Math.ceil(reported), MAX_FRAME_HEIGHT))
}

