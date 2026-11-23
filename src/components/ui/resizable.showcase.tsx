import type { Showcase } from "@/catalog/types"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default {
  title: "Resizable",
  group: "Layout",
  description: "Panels with handles between them that can be dragged, or moved with arrow keys, to resize.",
  examples: {
    "Two panels": () => (
      <ResizablePanelGroup direction="horizontal" className="min-h-[12rem] w-full max-w-lg rounded-lg border bg-card">
        <ResizablePanel defaultSize={35} minSize={20}>
          <div className="flex h-full items-center justify-center p-4 text-sm font-medium">Folders</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={30}>
          <div className="flex h-full items-center justify-center p-4 text-sm font-medium">Files</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    ),
  },
} satisfies Showcase
