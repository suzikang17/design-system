import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

function Demo() {
  const { toast } = useToast()
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Message sent",
            description: "Sam Chen will see it next time they sign in.",
            action: <ToastAction altText="Undo sending">Undo</ToastAction>,
          })
        }
      >
        Send message
      </Button>
      <Toaster />
    </>
  )
}

export default {
  title: "Toaster",
  group: "Feedback",
  description: "Renders the toasts queued with the useToast hook. Mount it once near the root of the app.",
  examples: { "Show a toast": Demo },
} satisfies Showcase
