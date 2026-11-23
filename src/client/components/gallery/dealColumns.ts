import type { Img } from '../photo/Photo'

export type Placed = { image: Img; index: number }

/** Deals photos into columns in the order given: each goes into the column that is shortest so far (the leftmost
 *  on a tie), so same-shape photos read across and mixed shapes keep the bottoms close. */
export function dealColumns(images: readonly Img[], count: number, uniform: boolean): Placed[][] {
  const cols: Placed[][] = Array.from({ length: count }, () => [])
  const heights = cols.map(() => 0)
  images.forEach((image, index) => {
    const c = heights.indexOf(Math.min(...heights))
    cols[c].push({ image, index })
    heights[c] += uniform || !image.width || !image.height ? 1 : image.height / image.width
  })
  return cols
}
