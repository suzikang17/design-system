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

## Layout of `src/client/`

- `components/<id>/` the pieces.
- `tokens/` the token contract (`contract.ts`), `base.css` and the looks (`themes/<id>.css`).
- `hooks/` the two hooks the pieces share, `useInView` and `useReducedMotion`.
- `catalog/` the meta model, the registry of metas and the state of a shareable link. The catalog pages in
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
