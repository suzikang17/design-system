import { Link } from "react-router-dom"

import { entries, entriesByGroup } from "@/catalog"
import { buttonVariants } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import site from "@/site.config"
import { ThemeGallery } from "../landing/ThemeGallery"
import { Workbench } from "../landing/Workbench"
import { useTitle } from "../useTitle"

const cta = (variant: "default" | "outline") => cn(buttonVariants({ variant, size: "lg" }), "rounded-full px-6")

export default function Landing() {
  useTitle()

  return (
    <div data-ready="">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 md:px-6 md:pb-14 md:pt-24">
        <h1 className="text-[clamp(2.75rem,10vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.04em] [font-stretch:82%]">
          {site.name}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">{site.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link to="/components" className={cta("default")}>
            Browse components
          </Link>
          <a href="#themes" className={cta("outline")}>
            See the themes
          </a>
          {site.contactUrl && (
            <a href={site.contactUrl} className={cta("outline")}>
              Get in touch
            </a>
          )}
        </div>
      </section>

      <section aria-label="Live components" className="mx-auto max-w-7xl px-4 md:px-6">
        <Workbench />
      </section>

      <ThemeGallery />
      <Inside />
      <Toaster />
    </div>
  )
}

function Inside() {
  const sections = entriesByGroup()
  return (
    <section aria-labelledby="inside-title" className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <div className="max-w-2xl">
          <h2 id="inside-title" className="text-3xl font-semibold tracking-tight md:text-4xl">
            What's inside
          </h2>
          <p className="mt-3 text-muted-foreground">
            {entries.length} components in {sections.length} groups. Each one installs with the shadcn CLI.
          </p>
        </div>
        <ul className="mt-10 grid border-t sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
          {sections.map(({ group, entries: members }) => (
            <li key={group} className="border-b">
              <Link to={`/components?group=${group}`} className="group grid grid-cols-[3.25rem_1fr] items-baseline gap-x-3 py-5">
                <span className="text-3xl font-semibold tabular-nums tracking-tight">{members.length}</span>
                <span>
                  <span className="font-semibold group-hover:text-primary">{group}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {members.slice(0, 4).map((entry) => entry.title).join(", ")}
                    {members.length > 4 ? ", and more" : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/components" className={cn(cta("default"), "mt-8")}>
          Browse all {entries.length} components
        </Link>
      </div>
    </section>
  )
}
