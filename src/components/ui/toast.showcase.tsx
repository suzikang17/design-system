import type { Showcase } from "@/catalog/types"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export default {
  title: "Toast",
  group: "Feedback",
  description: "The pieces of a Radix toast: title, description, action and close. The Toaster component renders them from the toast queue.",
  examples: {
    "A static toast": () => (
      <ToastProvider duration={Infinity}>
        <Toast open className="w-full max-w-sm">
          <div className="grid gap-1">
            <ToastTitle>Project archived</ToastTitle>
            <ToastDescription>You can restore it from Settings.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport className="static max-w-sm p-0" />
      </ToastProvider>
    ),
  },
} satisfies Showcase
