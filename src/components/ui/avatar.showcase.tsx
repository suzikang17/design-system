import type { Showcase } from "@/catalog/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const PEOPLE = ["Alex Rivera", "Sam Chen", "Priya Patel", "Jordan Lee"]
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("")

export default {
  title: "Avatar",
  group: "Data",
  description: "A round picture for a person, with initials while the image loads or when there is none.",
  examples: {
    "A stack of people": () => (
      <div className="flex -space-x-2">
        {PEOPLE.map((name) => (
          <Avatar key={name} className="border-2 border-background" title={name}>
            <AvatarFallback className="text-xs font-medium">{initials(name)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    ),
  },
} satisfies Showcase
