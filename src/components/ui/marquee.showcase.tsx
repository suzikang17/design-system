import type { Showcase } from "@/catalog/types"
import { Marquee } from "@/components/ui/marquee"

const PEOPLE = ["Alex Rivera", "Sam Chen", "Priya Patel", "Jordan Lee", "Maya Okafor", "Luis Romero"]

/** Fades the ends of the window the marquee runs in. */
const FADE_X = "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
const FADE_Y = "[mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"

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
      <div className={`w-full max-w-md overflow-hidden ${FADE_X}`}>
        <Marquee>
          {PEOPLE.map((name) => (
            <Chip key={name} name={name} />
          ))}
        </Marquee>
      </div>
    ),
    "Reversed, pausing on hover": () => (
      <div className={`w-full max-w-md overflow-hidden ${FADE_X}`}>
        <Marquee reverse pauseOnHover className="[--duration:25s]">
          {PEOPLE.map((name) => (
            <Chip key={name} name={name} />
          ))}
        </Marquee>
      </div>
    ),
    Vertical: () => (
      <div className={`h-48 overflow-hidden ${FADE_Y}`}>
        <Marquee vertical className="h-full [--duration:20s]">
          {PEOPLE.map((name) => (
            <Chip key={name} name={name} />
          ))}
        </Marquee>
      </div>
    ),
  },
} satisfies Showcase
