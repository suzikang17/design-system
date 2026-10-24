import type { Showcase } from "@/catalog/types"
import { Marquee } from "@/components/ui/marquee"

const PEOPLE = ["Alex Rivera", "Sam Chen", "Priya Patel", "Jordan Lee", "Maya Okafor", "Luis Romero"]

const Chip = ({ name }: { name: string }) => (
  <span className="whitespace-nowrap rounded-full border bg-card px-3 py-1 text-sm text-card-foreground">{name}</span>
)

export default {
  title: "Marquee",
  group: "Adopted",
  description: "A row of content that scrolls without end. It can run backwards, run vertically and pause on hover.",
  source: { name: "Magic UI", url: "https://magicui.design/docs/components/marquee" },
  license: "MIT",
  examples: {
    Default: () => (
      <div className="w-full max-w-md overflow-hidden">
        <Marquee>
          {PEOPLE.map((name) => (
            <Chip key={name} name={name} />
          ))}
        </Marquee>
      </div>
    ),
    "Reversed, pausing on hover": () => (
      <div className="w-full max-w-md overflow-hidden">
        <Marquee reverse pauseOnHover className="[--duration:25s]">
          {PEOPLE.map((name) => (
            <Chip key={name} name={name} />
          ))}
        </Marquee>
      </div>
    ),
    Vertical: () => (
      <div className="h-48 overflow-hidden">
        <Marquee vertical className="h-full [--duration:20s]">
          {PEOPLE.map((name) => (
            <Chip key={name} name={name} />
          ))}
        </Marquee>
      </div>
    ),
  },
} satisfies Showcase
