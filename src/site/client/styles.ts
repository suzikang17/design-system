/** The style pages of the Client work section, in nav order. */
export const STYLE_PAGES = [
  { id: "colour", title: "Colour", lede: "The palette each look sets. Every colour a piece uses comes from one of these names." },
  { id: "type", title: "Type", lede: "Six type roles, set in each look's own faces, case, spacing and scale." },
  {
    id: "motion",
    title: "Motion",
    lede: "The two easings and the reveal duration, with the shapes, shadows and grain that go with them.",
  },
] as const

export type StylePageId = (typeof STYLE_PAGES)[number]["id"]

export const stylePage = (id: string | undefined) => STYLE_PAGES.find((page) => page.id === id)
