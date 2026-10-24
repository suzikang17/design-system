import type { Showcase } from "@/catalog/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const VERSIONS = Array.from({ length: 30 }, (_, i) => `v1.${30 - i}.0`)

export default {
  title: "Scroll Area",
  group: "Layout",
  description: "A scrolling region with a thin, styled scrollbar that matches the theme.",
  examples: {
    "A long list": () => (
      <ScrollArea className="h-56 w-48 rounded-lg border bg-card">
        <div className="p-4">
          <p className="mb-3 text-sm font-medium">Releases</p>
          {VERSIONS.map((version) => (
            <div key={version}>
              <p className="text-sm tabular-nums">{version}</p>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
    ),
  },
} satisfies Showcase
