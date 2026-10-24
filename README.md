# Design System

React components, themes and tokens. The repo publishes them as a shadcn registry and shows them on a catalog site.

- Stack: React 18, TypeScript, Vite 7, Tailwind CSS 3.4, Radix UI, shadcn conventions.
- Components live in `src/components/ui`, themes in `src/styles/themes`, the site in `src/site`.

## Commands

```sh
pnpm install
pnpm dev          # the site, with live examples
pnpm build        # registry.json, then public/r/*.json (shadcn build), then dist/ (vite build)
pnpm preview      # serve dist/
pnpm test         # vitest
pnpm typecheck
pnpm lint
pnpm gen:registry # registry.json only
pnpm new <name>   # scaffold a component and its showcase
```

## Add a component

1. Run `pnpm new <name>`, for example `pnpm new tag-input`. It writes `src/components/ui/<name>.tsx` and `src/components/ui/<name>.showcase.tsx`. It does not overwrite files.
2. Build the component in `<name>.tsx`. Import only `@/lib/utils`, `@/hooks/*`, `@/components/ui/*` and npm packages listed in `package.json`. The registry build stops on any other import.
3. Fill in the showcase: `title`, `group`, `description` and `examples`. Write `title`, `group` and `description` as double-quoted strings before `examples`, because the catalog and the registry read them from the file's text.

Groups: Inputs, Controls, Navigation, Overlays, Feedback, Data, Layout, Adopted.

The two files are the whole registration. The nav entry, the index card, the page and the registry item come from them. A component without a showcase still gets a page and a "No examples yet" mark. Data that belongs to a component goes in `<name>.data.ts`, which ships in the same registry item.

## Update a component

1. Edit `src/components/ui/<name>.tsx` and its showcase.
2. Run `pnpm test`. The test renders every example and checks the showcase fields.
3. Build. The build writes `registry.json` and `public/r/<name>.json` again. Do not edit those files.

## Adopt a component from another registry

`components.json` names four registries: `@magicui`, `@aceternity`, `@originui` and `@kibo-ui`.

1. Run `pnpm dlx shadcn@latest add @<ns>/<item>`, for example `pnpm dlx shadcn@latest add @magicui/marquee`.
2. Review the diff. The CLI adds the npm packages the item needs and can change `tailwind.config.ts` and `src/index.css`.
3. Add `src/components/ui/<item>.showcase.tsx` with `group: "Adopted"`, a `source` and a `license`:

```tsx
import type { Showcase } from "@/catalog/types"
import { Marquee } from "@/components/ui/marquee"

export default {
  title: "Marquee",
  group: "Adopted",
  description: "A row of content that scrolls without end.",
  source: { name: "Magic UI", url: "https://magicui.design/docs/components/marquee" },
  license: "MIT",
  examples: {
    Default: () => <Marquee>Alex Rivera, Sam Chen, Priya Patel</Marquee>,
  },
} satisfies Showcase
```

The page then credits the source and names the license. Log components worth adopting in `inspiration.md`.

## Add a theme

1. Copy `src/styles/themes/sky.css` to `src/styles/themes/<id>.css`.
2. Change the selector to `[data-theme="<id>"]`. Only the default theme also carries `:where(:root)`.
3. Change the token values. Set `color-scheme: dark` for a dark theme.
4. Add `{ id, label, swatch }` to `src/themes.ts`. Add `dark: true` for a dark theme.
5. Run `pnpm test`. A test checks that every text and background pair meets WCAG AA (4.5:1).

The theme switcher, the landing page and the registry find the new theme. In the registry item, a light theme's tokens go in `cssVars.light` and a dark theme's in `cssVars.dark`.

## Install from this registry in a new project

The components expect Tailwind CSS 3.4 and HSL channel tokens such as `--primary: 201 96% 32%`.

1. Start from a React project with Tailwind CSS 3.4.
2. Run `pnpm dlx shadcn@latest init`.
3. Add a theme: `pnpm dlx shadcn@latest add <site>/r/sky.json`.
4. Add a component: `pnpm dlx shadcn@latest add <site>/r/<name>.json`.

`<site>` is the address of the deployed site. Each component page shows its own command. The CLI also installs the items it depends on from `<site>/r/` and the npm packages, at the version ranges this repo uses.

## Deploy on Vercel

1. Import the repository in Vercel. `vercel.json` sets the build command, the `dist` output and the rewrite that sends page routes to `index.html`.
2. Set `SITE_URL` to the site's public address, for example `https://design.example.com`. The registry uses it for `homepage` and for the URLs of item dependencies. Without it, the build uses the Vercel production domain, then `https://design-system.vercel.app`.
3. Optional: set `VITE_SHOW_INSPIRATION=true` to show the Inspiration link in the header. The page at `/inspiration` renders `inspiration.md`.

## Site settings

`src/site.config.ts` holds the site name, the tagline and a contact URL. The contact link stays hidden while the URL is empty.
