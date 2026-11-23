import type { Showcase } from "@/catalog/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export default {
  title: "Alert Dialog",
  group: "Overlays",
  description: "A dialog that interrupts to confirm a decision, such as a deletion. It closes only through its buttons.",
  examples: {
    "Confirm a deletion": () => (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete workspace</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
            <AlertDialogDescription>Its projects and files are removed for everyone. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep workspace</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
} satisfies Showcase
