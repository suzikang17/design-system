# Client work

Pieces ported from client sites (We Curate Life, ur love matters): `components/<id>/` holds each piece's
`.tsx`, `.css`, `.meta.ts` and tests; `tokens/` the token contract, `base.css` and the three looks;
`hooks/` the two hooks they share; `catalog/` the meta model, the registry of metas and the link state.

These pieces use plain CSS and `--ds-` custom properties on purpose, not Tailwind: they are copied out into
projects that may not run Tailwind, and they must match the live sites. A piece is styled by an ancestor with
class `ds-root` and `data-theme="<look>"`. Shipped files import each other by relative path, never `@/`.

How to write and change a piece: `docs/CONVENTIONS.md`.
