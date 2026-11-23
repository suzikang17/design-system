import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TranslationSafeForm } from "@/components/ui/translation-safe-form"

export default {
  title: "Translation Safe Form",
  group: "Inputs",
  description:
    "A form, input and div that tell browser translation tools to leave them alone, so automatic translation cannot break React's hold on the form.",
  examples: {
    "Sign-in form": () => (
      <TranslationSafeForm onSubmit={(event) => event.preventDefault()} className="w-full max-w-xs space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="safe-email">Email</Label>
          <Input id="safe-email" type="email" placeholder="alex@example.com" />
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </TranslationSafeForm>
    ),
  },
} satisfies Showcase
