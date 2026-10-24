# Design System

React components, themes and tokens. The repo publishes them as a shadcn registry and shows them on a catalog site.

- Stack: React 18, TypeScript, Vite 7, Tailwind CSS 3.4, Radix UI, shadcn conventions.
- Components live in `src/components/ui`, themes in `src/styles/themes`, the site in `src/site`.

## Commands

```sh
pnpm install
pnpm dev            # build the registry for http://localhost:5173, then serve the site with live examples
pnpm build          # build the registry, then dist/ (vite build)
pnpm preview        # serve dist/ on http://localhost:4173
pnpm registry       # registry.json (gen:registry), then public/r/*.json (build:registry)
pnpm test           # vitest
pnpm typecheck
pnpm lint
pnpm gen:registry   # registry.json only
pnpm build:registry # public/r/*.json from registry.json (shadcn build)
pnpm new <name>     # scaffold a component and its showcase
```

## Add a component

1. Run `pnpm new <name>`, for example `pnpm new tag-input`. It writes `src/components/ui/<name>.tsx` and `src/components/ui/<name>.showcase.tsx`. It does not overwrite files.
2. Build the component in `<name>.tsx`. It can import:
   - `@/lib/utils`, `@/hooks/<hook>`, and other components as `@/components/ui/<name>` or `./<name>`. Each one becomes a registry dependency.
   - npm packages in the `dependencies` of `package.json`. A package that is only in `devDependencies` stops the build. `react` and `react-dom` are not published as dependencies.

   Any other `@/` path or a `../` path stops the registry build. The build reads imports from the syntax tree, so text in comments and strings does not count. Import types with `import type`: projects that install the component compile it with `verbatimModuleSyntax`, and `pnpm typecheck` uses the same setting.

   The registry publishes each npm package as a bare name, so the shadcn CLI keeps the version a project already has. If the component needs a specific major version, add the package to `PINNED` in `scripts/gen-registry.ts` with the reason. If the component uses a Tailwind color or animation that `shadcn init` does not write, add it to `tailwind.config.ts`. The registry then ships it with each item that uses it.
3. Fill in the showcase: `title`, `group`, `description` and `examples`. Write `title`, `group` and `description` as double-quoted strings before `examples`, because the catalog and the registry read them from the file's text.

Groups: Inputs, Controls, Navigation, Overlays, Feedback, Data, Layout, Adopted.

The two files are the whole registration. The nav entry, the index card, the page and the registry item come from them. A component without a showcase still gets a page and a "No examples yet" mark. Data that belongs to a component goes in `<name>.data.ts`, which ships in the same registry item.

## Update a component

1. Edit `src/components/ui/<name>.tsx` and its showcase.
2. Run `pnpm test`. The test renders every example and checks the showcase fields.
3. Build. The build writes `registry.json` and `public/r/<name>.json` again. Do not edit those files.

## Adopt a component from another registry

`components.json` names four registries: `@magicui`, `@aceternity`, `@originui` and `@kibo-ui`.

1. Run `pnpm dlx shadcn@latest add @<ns>/<item>`, for example `pnpm dlx shadcn@latest add @magicui/marquee`. The CLI writes the component to `src/components/ui/<item>.tsx` and installs the npm packages it needs.
2. Review the diff. Many registry items target Tailwind CSS 4, and this repo uses 3.4. For a Tailwind 4 item, the CLI writes `@theme` blocks and `--animate-*` variables into `src/index.css`, and the component can use Tailwind 4 class syntax. Port it to 3.4:
   - Remove the `@theme` block and the `--animate-*` variables from `src/index.css`.
   - Add the keyframes and the animations to `theme.extend` in `tailwind.config.ts`.
   - Change Tailwind 4 classes to their 3.4 form, for example `gap-(--gap)` to `gap-[--gap]`.
3. Add `src/components/ui/<item>.showcase.tsx` with `group: "Adopted"`, a `source` and a `license`:

```tsx
import type { Showcase } from "@/catalog/types"
import { Marquee } from "@/components/ui/marquee"

const PEOPLE = ["Alex Rivera", "Sam Chen", "Priya Patel"]

export default {
  title: "Marquee",
  group: "Adopted",
  description: "A row of content that scrolls without end.",
  source: { name: "Magic UI", url: "https://magicui.design/docs/components/marquee" },
  license: "MIT",
  examples: {
    Default: () => (
      <Marquee>
        {PEOPLE.map((name) => (
          <span key={name} className="rounded-full border px-3 py-1 text-sm">
            {name}
          </span>
        ))}
      </Marquee>
    ),
  },
} satisfies Showcase
```

The page then credits the source and names the license. `src/components/ui/marquee.tsx` and its showcase show the result of these steps. Log components worth adopting in `inspiration.md`.

## Add a theme

1. Copy `src/styles/themes/sky.css` to `src/styles/themes/<id>.css`.
2. Change the selector to `[data-theme="<id>"]`. Only the default theme also carries `:where(:root)`.
3. Change the token values. Set `color-scheme: dark` for a dark theme.
4. Add `{ id, label, swatch }` to `src/themes.ts`. Add `dark: true` for a dark theme.
5. Run `pnpm test`. A test checks that every text and background pair meets WCAG AA (4.5:1).

The theme switcher, the landing page and the registry find the new theme. In the registry item, a light theme's tokens go in `cssVars.light` and a dark theme's in `cssVars.dark`.

## Install from this registry in a new project

The components expect Tailwind CSS 3.4 and HSL channel tokens such as `--primary: 201 96% 32%`.

1. Start from a React project with Tailwind CSS 3.4 and an `@/*` import alias for `src/*`.
2. Run `pnpm dlx shadcn@3 init`. Use version 3: the `init` command of shadcn 4 sets up Tailwind CSS 4 styles, and a 3.4 project then fails to build.
3. Add a theme: `pnpm dlx shadcn@latest add <site>/r/sky.json`.
4. Add a component: `pnpm dlx shadcn@latest add <site>/r/<name>.json`.

`<site>` is the address of the deployed site. Each component page shows its own command. The CLI also:

- installs the items that the component depends on from `<site>/r/`.
- adds the Tailwind theme keys that the component needs, such as the sidebar colors and the accordion keyframes, to `tailwind.config`.
- installs npm packages by bare name. A package that the project already has keeps its version.

Four packages have a version range, because the code needs that major version: `react-day-picker` 8, `recharts` 2, `@tanstack/react-table` 8 and `react-resizable-panels` 2. `react-day-picker` 8 declares `date-fns` 2 or 3 as a peer. With `date-fns` 4, pnpm shows a peer warning, and the calendar works.

## Deploy on Vercel

1. Import the repository in Vercel. `vercel.json` sets the build command, the `dist` output and the rewrite that sends page routes to `index.html`.
2. Keep "Enable access to System Environment Variables" checked in the project's Environment Variables settings. The registry build reads `VERCEL`, `VERCEL_ENV`, `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL`. With the setting off, set `SITE_URL`.
3. Optional: set `VITE_SHOW_INSPIRATION=true` to show the Inspiration link in the header. The page at `/inspiration` renders `inspiration.md`.

The registry uses one address for `homepage` and for the URLs of item dependencies. The build picks the first that applies:

1. `SITE_URL`, for example `https://design.example.com`.
2. On Vercel, for a production build: `https://` and `VERCEL_PROJECT_PRODUCTION_URL`.
3. On Vercel, for a preview build: `https://` and `VERCEL_URL`. The items of a preview and their dependencies then come from that preview. If Deployment Protection covers previews, the CLI gets a 401 from them.
4. Locally: `http://localhost:5173` for `pnpm dev`, and `http://localhost:4173` for `pnpm build` and `pnpm preview`.

When `CI` or `VERCEL` is set and no address applies, the build fails.

## Site settings

`src/site.config.ts` holds the site name, the tagline and a contact URL. The contact link stays hidden while the URL is empty.
