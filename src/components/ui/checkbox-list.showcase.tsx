import { useState, type ReactNode } from "react"

import type { Showcase } from "@/catalog/types"
import { CheckboxList } from "@/components/ui/checkbox-list"

const TOPICS = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "research", label: "Research" },
  { value: "writing", label: "Writing" },
  { value: "support", label: "Support" },
]

/** The list attaches under a header of its own: it has no top border. */
function Header({ children }: { children: ReactNode }) {
  return <div className="rounded-t-2xl border bg-muted/50 px-4 py-3 text-sm font-medium">{children}</div>
}

function PickSeveral() {
  const [selected, setSelected] = useState(["research"])
  const toggle = (value: string) =>
    setSelected((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]))
  return (
    <div className="w-full max-w-sm">
      <Header>Topics you follow</Header>
      <CheckboxList items={TOPICS} selected={selected} onToggle={toggle} />
    </div>
  )
}

function Preferred() {
  const [selected, setSelected] = useState(["design", "writing"])
  const [starred, setStarred] = useState("design")
  const toggle = (value: string) =>
    setSelected((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]))
  return (
    <div className="w-full max-w-sm">
      <Header>Topics, with one favorite</Header>
      <CheckboxList items={TOPICS} selected={selected} onToggle={toggle} starredValue={starred} onStarToggle={setStarred} />
    </div>
  )
}

function Capped() {
  const [selected, setSelected] = useState(["design", "engineering"])
  const [note, setNote] = useState("")
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value))
      setNote("")
    } else if (selected.length >= 2) {
      setNote("You can follow up to two topics. Clear one first.")
    } else {
      setSelected([...selected, value])
    }
  }
  return (
    <div className="w-full max-w-sm space-y-2">
      <div>
        <Header>Up to two topics</Header>
        <CheckboxList items={TOPICS} selected={selected} onToggle={toggle} maxItems={2} />
      </div>
      <p aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
        {note}
      </p>
    </div>
  )
}

export default {
  title: "Checkbox List",
  group: "Controls",
  description:
    "A list of checkable rows that floats checked items to the top. Rows can carry a star to mark one preferred item, and a cap can limit how many are checked.",
  examples: {
    "Pick several": PickSeveral,
    "Mark one as preferred": Preferred,
    "With a cap": Capped,
  },
} satisfies Showcase
