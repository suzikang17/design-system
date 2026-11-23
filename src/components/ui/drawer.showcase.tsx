import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default {
  title: "Drawer",
  group: "Overlays",
  description: "A panel that slides up from the bottom edge and can be dragged closed, built on vaul.",
  examples: {
    "Confirm an action": () => (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Archive project</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Archive this project?</DrawerTitle>
              <DrawerDescription>It leaves the project list. You can restore it from Settings.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Archive</Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    ),
    "With a form": () => (
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Rename</Button>
        </DrawerTrigger>
        <DrawerContent>
          <form className="mx-auto w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
            <DrawerHeader>
              <DrawerTitle>Rename project</DrawerTitle>
              <DrawerDescription>Names show in the sidebar and in shared links.</DrawerDescription>
            </DrawerHeader>
            <div className="space-y-1.5 px-4">
              <Label htmlFor="drawer-name">Name</Label>
              <Input id="drawer-name" defaultValue="Website redesign" />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button type="submit">Save</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    ),
  },
} satisfies Showcase
