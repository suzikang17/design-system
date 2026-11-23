import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default {
  title: "Dialog",
  group: "Overlays",
  description: "A window over the page that holds focus until it is closed.",
  examples: {
    "Edit in a dialog": () => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Changes show on your public page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="dialog-name">Name</Label>
            <Input id="dialog-name" defaultValue="Alex Rivera" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
} satisfies Showcase
