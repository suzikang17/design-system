/** The link itself when it goes to the web, otherwise nothing to link to. */
export const safeHref = (href: string): string | undefined => (/^https?:\/\//i.test(href) ? href : undefined)
