import type { ComponentType, ReactNode } from 'react'

/** A stand-in for content, for pieces that only arrange their children. Catalog only: styled in tokens/all.css. */
export function Block({ children, tall }: { children: ReactNode; tall?: boolean }) {
  return (
    <div className="ds-demo-block" data-tall={tall ? '' : undefined}>
      {children}
    </div>
  )
}

const NAMES = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']

/** What the catalog draws for a layout piece: the piece itself, holding numbered blocks. `count` may follow the
 *  piece's options (Columns shows one block per column). `padded` leaves room around it, as a page would. */
// eslint-disable-next-line react-refresh/only-export-components -- makes a component; only the catalog uses it
export function withBlocks<P extends object>(
  Component: ComponentType<P & { children?: ReactNode }>,
  count: number | ((props: P) => number),
  { padded = true, uneven = false }: { padded?: boolean; uneven?: boolean } = {},
): ComponentType<P> {
  function Demo(props: P) {
    const n = Math.min(NAMES.length, Math.max(1, typeof count === 'function' ? count(props) : count))
    const piece = (
      <Component {...props}>
        {NAMES.slice(0, n).map((name, index) => (
          <Block key={name} tall={uneven && index % 2 === 1}>
            {n === 1 ? 'Your content' : name}
          </Block>
        ))}
      </Component>
    )
    return padded ? <div className="ds-demo-pad">{piece}</div> : piece
  }
  return Demo
}
