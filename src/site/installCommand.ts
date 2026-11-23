/** The command that installs a registry item (a component, a theme, a client piece or a look) from this site,
 *  wherever the site is served. */
export const installCommand = (item: string) => `pnpm dlx shadcn@latest add ${window.location.origin}/r/${item}.json`
