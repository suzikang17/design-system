import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PillButton } from "@/components/ui/pill"
import { themes } from "@/themes"
import { ThemeSwatch, useTheme } from "./theme"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton variant="outline" aria-label={`Theme: ${theme.label}`} className="gap-2 px-2.5 sm:px-3">
          <ThemeSwatch theme={theme} />
          <span className="hidden sm:inline">{theme.label}</span>
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme.id} onValueChange={setTheme}>
          {themes.map((option) => (
            <DropdownMenuRadioItem key={option.id} value={option.id} className="gap-2.5">
              <ThemeSwatch theme={option} />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
