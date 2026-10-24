import type { Showcase } from "@/catalog/types"
import { Input } from "@/components/ui/input"
import { Key } from "@/components/ui/key"
import { Label } from "@/components/ui/label"
import { PillButton } from "@/components/ui/pill"

export default {
  title: "Key",
  group: "Data",
  description: "A key icon as a component, sized and colored with a class name.",
  examples: {
    Sizes: () => (
      <div className="flex items-end gap-4 text-foreground">
        <Key className="size-4" />
        <Key className="size-6" />
        <Key className="size-8 text-primary" />
      </div>
    ),
    "In a button": () => (
      <PillButton variant="outline">
        <Key />
        Create an API key
      </PillButton>
    ),
    "In a field": () => (
      <div className="w-full max-w-xs space-y-1.5">
        <Label htmlFor="key-field">API key</Label>
        <div className="relative">
          <Key className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="key-field" readOnly value="ds_4f9a2b7c…c21e" className="pl-9 font-mono" />
        </div>
      </div>
    ),
  },
} satisfies Showcase
