import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { allMeta } from "@/client/catalog/registry"
import { THEMES } from "@/client/tokens/contract"
import { CodeBlock } from "../CodeBlock"
import { CopyButton } from "../CopyButton"
import { useTitle } from "../useTitle"
import { installCommand, pieceTitle } from "./model"
import { ASTRO_LAYOUT, ASTRO_PAGE, CLIENT_PIECES, COMPONENTS_JSON, NEXT_LAYOUT, NEXT_PAGE } from "./using"

const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>
)

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="mt-12">
      <h2 id={`step-${n}`} className="mb-4 flex items-center gap-3 text-xl font-semibold tracking-tight">
        <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm text-primary">
          {n}
        </span>
        {title}
      </h2>
      <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
  )
}

/** One command on one line, with its own copy button, like the install command on a piece's page. */
function Command({ command, label }: { command: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card py-1 pl-4 pr-1 text-foreground">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 font-mono text-[13px]">{command}</code>
      <CopyButton value={command} label={label} />
    </div>
  )
}

const list = (items: ReactNode[]) =>
  items.map((item, i) => (
    <span key={i}>
      {i > 0 && (i === items.length - 1 ? " and " : ", ")}
      {item}
    </span>
  ))

export default function ClientUsing() {
  useTitle(pieceTitle("Using these"))
  const clientNames = CLIENT_PIECES.map((id) => allMeta.find((meta) => meta.id === id)?.name ?? id).join(", ")

  return (
    <article data-ready="" className="max-w-3xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Using these</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Every piece copies into a React project as plain source files, with no package to install or update. The
          shadcn command line tool does the copying, reading this site's registry. No Tailwind needed.
        </p>
      </header>
      <p className="mt-6 text-muted-foreground">
        Tried in a new Next.js app (App Router) and a new Astro app with the React integration. A React 18 or 19 project
        whose bundler can import a CSS file should work the same way. A project needs a one-time setup, then each piece
        is one command.
      </p>

      <Step n={1} title="Add a components.json">
        <p>
          Put this file at the project root first. The tool refuses a file without the <C>style</C> and <C>tailwind</C>{" "}
          entries, but nothing here installs Tailwind; without the file it would offer to set Tailwind up instead. Set{" "}
          <C>rsc</C> to <C>false</C> outside Next.js. A project that already uses shadcn keeps its own file.
        </p>
        <CodeBlock code={COMPONENTS_JSON} filename="components.json" />
      </Step>

      <Step n={2} title="Add the base and a look">
        <p>
          The base is the token contract, the shared rules every piece relies on, and two hooks. A look is one CSS file
          of token values, and brings the <C>@fontsource</C> packages its faces come from. The looks are{" "}
          {list(THEMES.map((look) => <C key={look.id}>client-look-{look.id}</C>))}; add as many as you like.
        </p>
        <ul className="space-y-3">
          <li>
            <span className="mb-1 block text-sm font-medium text-foreground">Base</span>
            <Command command={installCommand("client-base")} label="Copy the base command" />
          </li>
          {THEMES.map((look) => (
            <li key={look.id}>
              <span className="mb-1 block text-sm font-medium text-foreground">{look.label}</span>
              <Command command={installCommand(`client-look-${look.id}`)} label={`Copy the ${look.label} look command`} />
            </li>
          ))}
        </ul>
        <p>
          Files land under <C>src/client/</C> at the project root (<C>src/client/tokens</C>, <C>src/client/hooks</C>,{" "}
          <C>src/client/components</C>), keeping this site's layout, whether or not the project already uses a{" "}
          <C>src/</C> folder. They reach each other by relative path, so your import alias does not matter to them.
        </p>
      </Step>

      <Step n={3} title="Import it once and wrap the app">
        <p>
          Import the base and the look once, at the top of the app, and wrap the content in an element with class{" "}
          <C>ds-root</C> and the look's <C>data-theme</C>. Pieces outside that wrapper are unstyled.
        </p>
        <CodeBlock code={NEXT_LAYOUT} filename="Next.js layout" />
        <p>
          The <C>@/</C> above points at <C>src/</C>, as in an app made with <C>create-next-app --src-dir</C>. In a default
          Next.js app without a <C>src/</C> folder it points at the project root, so write <C>@/src/client/tokens/base.css</C>{" "}
          and <C>@/src/client/components/...</C>.
        </p>
        <CodeBlock code={ASTRO_LAYOUT} filename="Astro layout" />
      </Step>

      <Step n={4} title="Add pieces, one command each">
        <p>
          Each command copies the piece's files and anything it builds on (Select brings Input, Modal brings Button). Run
          it again with <C>--overwrite</C> to take a newer version; that replaces your own edits to those files.
        </p>
        <ul className="space-y-3">
          {allMeta.map((meta) => (
            <li key={meta.id}>
              <Link to={`/client/${meta.id}`} className="mb-1 inline-block text-sm font-medium text-foreground hover:text-primary">
                {meta.name}
              </Link>
              <Command command={installCommand(`client-${meta.id}`)} label={`Copy the ${meta.name} install command`} />
            </li>
          ))}
        </ul>
        <p>
          Then import a piece where you use it. In a Next.js app without a <C>src/</C> folder, write{" "}
          <C>@/src/client/components/button/Button</C>, as in step 3.
        </p>
        <CodeBlock code={NEXT_PAGE} filename="Next.js page" />
        <CodeBlock code={ASTRO_PAGE} filename="Astro page" />
      </Step>

      <section aria-labelledby="notes" className="mt-12">
        <h2 id="notes" className="mb-4 text-xl font-semibold tracking-tight">
          Good to know
        </h2>
        <ul className="list-disc space-y-3 pl-5 text-muted-foreground marker:text-border">
          <li>
            Next.js: pieces with state, effects or their own handlers ({clientNames}) already start with{" "}
            <C>'use client'</C>, so a Server Component page can import them. Handlers you pass in, such as{" "}
            <C>onChange</C>, still need a Client Component of your own.
          </li>
          <li>
            Astro: pieces render as static HTML unless given a client directive. Anything you click or type into, and
            anything that animates as it scrolls into view, needs one, such as <C>client:load</C> or{" "}
            <C>client:visible</C>.
          </li>
          <li>
            Fonts: the We Curate Life look declares its two script faces itself, to scale them, with font paths relative
            to <C>src/client/tokens/themes/</C> that expect <C>node_modules</C> at the project root. Keep the file where
            it lands. In a monorepo that hoists packages to the workspace root, change those three <C>url()</C> paths to
            match.
          </li>
          <li>
            Images are plain <C>{"{ src, alt, width, height }"}</C> objects, so they work with files in <C>public/</C> or
            any image URL.
          </li>
          <li>
            The registry lives at <C>{window.location.origin}/r/</C>. Each piece's page shows its command, a usage example
            and its source.
          </li>
        </ul>
      </section>
    </article>
  )
}
