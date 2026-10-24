import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// The page's theme, read from the root element: the `dark` class, or data-theme="dark".
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] })
  return () => observer.disconnect()
}

function pageTheme(): "light" | "dark" {
  const root = document.documentElement
  return root.classList.contains("dark") || root.dataset.theme === "dark" ? "dark" : "light"
}

/** Toasts follow the page's light or dark theme, not the operating system's. Pass `theme` to override. */
const Toaster = ({ ...props }: ToasterProps) => {
  const theme = React.useSyncExternalStore(subscribe, pageTheme, () => "light" as const)

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
