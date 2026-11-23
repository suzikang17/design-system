/** Dev-only (tests): whether a shipped component file needs Next's `'use client'`. A hook call, an event handler
 *  the file defines itself (a named `handle*` function or an inline arrow), or a render function passed as
 *  children (a Server Component cannot hand a function to a Client Component). */
export const needsClient = (src: string) =>
  /\buse[A-Z]\w*(<[^>]*>)?\(/.test(src) || /\bon[A-Z]\w*=\{\s*(\(|handle)/.test(src) || /\{\s*\(\{[^}]*\}\)\s*=>/.test(src)
