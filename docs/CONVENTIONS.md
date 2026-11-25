# Conventions

How the client pieces, their tokens and the catalog fit together. Tests enforce most of this; the rest is here so
the next piece looks like the last one. These rules cover `src/client/`. The 75 Tailwind components in
`src/components/ui` follow the README's "Add a component" instead.

## A client piece

`src/client/components/<id>/` holds `<Name>.tsx`, `<id>.css`, `<id>.meta.ts` and `<id>.test.tsx`. The folder name is
the meta `id`. The registry item is `client-<id>` and the page is `/client/<id>`. `src/client/components/button/` is
the reference.

- Plain props and children. No imports from `src/client/catalog/`, `sanity`, `next` or `astro`. Images are
  `{ src, alt, width, height, srcSet? }` (`Img`, exported by `photo/Photo.tsx`, with true intrinsic size); links are
  `href`.
- Shipped files import each other by relative path, never `@/`, because they are copied into projects that have no
  such alias. A piece that builds on another one imports it from its folder (`../input/Input`).
- A file with state, effects, its own handlers or a render-function child starts with `'use client'`, so a Next.js
  Server Component page can import it.
- Pieces work on React 18 and on React 19. Do not use a React-19-only API. `src/client/react18.test.tsx` renders
  every piece in StrictMode and fails on any React warning.
- Class names: block `ds-<id>`, modifier `ds-<id>--<name>`, state `is-<name>`.
- Variants are a `variant` prop. Form fields share `variant: 'box' | 'line'`.
- No hard-coded element ids: use `useId`.
- Every transition and animation is off under `prefers-reduced-motion: reduce`, with content in its final state.
- Entrances use `useInView` (`src/client/hooks/`) and run again on remount, which is what the catalog's Replay does.
- Plain CSS and custom properties, not Tailwind, on purpose: the pieces are copied into projects that may not run
  Tailwind. A piece is styled by an ancestor with class `ds-root` and `data-theme="<look>"`.

## Layout pieces

Container, Stack, Row, Columns and Grid (group `layout`) only arrange their children. They take `children`, pass
other attributes and `className` to their element, have no look of their own (`origin: []`, `homeTheme: 'neutral'`)
and share one spacing scale for `gap`: none, xs 8px, sm 16px, md 24px, lg 40px, xl 64px. Each piece defines the
scale in its own CSS, because pieces are copied out one at a time.

- Container caps the width (1180px for `page`, the same as the sections) inside `--ds-gutter`. A new section uses
  the same cap and gutters so it lines up with content in a Container.
- Columns and Grid follow their own width (container queries, `auto-fill`), never the screen's, so they behave
  inside a narrow slot. Columns takes any split as shares: `split="5/7"`.
- A layout piece shows nothing by itself, so its meta has `demo`: `withBlocks(Piece, count)` from
  `src/client/catalog/LayoutDemo.tsx`, which the previews and cards draw in place of `component`. `demo` is catalog
  only and does not ship.

## Playground

`/client/playground` arranges pieces on a page drawn inside the device frame (`src/site/client/playground/model.ts`
holds the page model, `ClientPlaygroundPage.tsx` is the page inside the frame). A page is a list of items; an item of
a layout piece holds lists of items, one per slot (one per column for Columns, one for the others). A place is a
path: `[index]` on the page, `[index, slot, index]` inside a layout piece. Layout pieces nest two deep and a page
holds 24 pieces in all, whatever a link says. The tray offers layout pieces as
structures (`STRUCTURES`: a layout piece with its options set, drawn as a wireframe) and everything else as pieces.
Every slot has an "Add a piece" button that selects the slot; a piece tapped in the tray goes into the selected
slot (`addPath`). The starter page is a nav bar, one empty two-column structure and a footer. The page can be set in a picked pair of fonts (`FONT_SETS` in `playground/fonts.ts`, `font=<id>` in the link): the pick overrides the look's font tokens on the page's root, and a set may only name fonts a look already loads. A new layout piece is droppable in the playground without further
work; a layout piece with more than one slot needs a case in `slotCount` and in the page's `renderItem`.

## Layout of `src/client/`

- `components/<id>/` the pieces.
- `tokens/` the token contract (`contract.ts`), `base.css` and the looks (`themes/<id>.css`).
- `hooks/` the two hooks the pieces share, `useInView` and `useReducedMotion`.
- `catalog/` the meta model, the registry of metas, the state of a shareable link and the layout pieces' demos. The catalog pages in
  `src/site/client/` read these.

## Tokens and looks

A client theme is called a look in the UI, in the docs and in registry names. "Theme" means Sky, Midnight and Ember,
the Tailwind site's themes, which do not restyle client pieces. The look's query parameter is `look`.

- `--ds-*` is the contract (`src/client/tokens/contract.ts`). A look fills exactly that list. A look may set these
  and nothing else.
- `--_ds-<component>-<name>` is local to one component's CSS. Lengths and durations with no contract token live here.
- Component CSS has no literal colours, font families, easings or durations outside local property definitions
  (`src/client/tokens/lint.ts` checks every `src/client/components/**/*.css`).
- A value that differs per look for one component is a contract token named `--ds-<component>-<name>`.
- Once a look is in use elsewhere, a new contract token is read with a fallback (`var(--ds-new, <old behaviour>)`),
  so looks copied out earlier keep working.
- Do not fix a visual difference in a component. Fix it in `src/client/tokens/base.css`, scoped to `.ds-root`.
  `base.css` ships to every consumer, so it holds only `.ds-root` rules and no bare element selector (a test checks). A rule that only the catalog needs goes in `tokens/all.css`, which does not ship.

## Meta

`defineMeta` in `src/client/catalog/meta.ts`. The registry generator reads each meta as text, without running it, so
`id`, `name`, `summary`, `files`, `dependencies` and `registryDependencies` must be plain literals: strings and
arrays of strings, no variables, no spreads, no template strings with substitutions.

- `files` lists what ships, as repo-relative paths from the piece's own folder only. Tokens and hooks ship through
  `client-base` and the looks.
- `registryDependencies` lists other piece ids, or `'base'`. `dependencies` lists npm packages, which must be in
  `package.json`.
- Only props with an entry in `controls` can be set from a shared link, so never give `href`, `src` or an image a
  control.
- `previewWidth` gives block-level pieces a sensible width in the preview (form fields otherwise shrink to their
  content); `cardProps` overrides defaults for the home card only. Both are catalog only and do not ship.
- `usage` includes its import line.

## Registry

Each piece publishes as `client-<id>`. `client-base` is the token contract, `base.css` and the two hooks; every piece
depends on it. Each look publishes as `client-look-<id>` and brings the `@fontsource` packages its faces come from.
`pnpm gen:registry` builds `registry.json` and `pnpm build:registry` builds `public/r/*.json`; both are generated
and ignored by git.

## Tests each piece has

Render and behaviour; an empty value and a 300-character value; two instances on one page when it has state; the
tokens-only CSS checks; reduced motion. `pnpm e2e` visits every piece in every look at 1280x800 and 390x844 without
further setup.

## Matching a client site

Measure the rendered live page (`getComputedStyle` in each state, at 1280 and 390 wide) and build to those numbers.
Reading a site's stylesheet is not enough: later rules and page wrapper classes decide what a visitor sees. Make sure
the source you read is the branch that is live. The bar is "recognisably the same piece", not a pixel match. Demos
use neutral wording and the photos in `public/placeholders/`, never client copy or client photos.
