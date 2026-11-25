/** The shares in a split, e.g. '2/1' is [2, 1]. Anything unusable is two halves. */
export function splitShares(split: string | undefined): number[] {
  const shares = (split ?? '')
    .split('/')
    .map((part) => Number(part.trim()))
    .filter((share) => Number.isFinite(share) && share > 0)
    .slice(0, 12)
  return shares.length > 0 ? shares : [1, 1]
}
