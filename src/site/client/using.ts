/** Copy for the Using these page that tests also read. */

/** The minimum the shadcn CLI accepts: it insists on `style` and a `tailwind` block, but installs nothing from them. */
export const COMPONENTS_JSON = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "", "css": "", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}`

/** Pieces whose shipped files start with `'use client'`; ClientUsing.test.tsx holds this to the files themselves. */
export const CLIENT_PIECES: readonly string[] = ["select", "modal", "phone-input", "input", "textarea", "chips", "eyebrow", "gallery", "cta-band", "faq", "hero", "nav-bar", "steps"]

export const NEXT_LAYOUT = `// src/app/layout.tsx
import "@/client/tokens/base.css";
import "@/client/tokens/themes/wecuratelife.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="ds-root" data-theme="wecuratelife">{children}</div>
      </body>
    </html>
  );
}`

export const ASTRO_LAYOUT = `---
// src/layouts/Layout.astro
import "../client/tokens/base.css";
import "../client/tokens/themes/wecuratelife.css";
---
<html lang="en">
  <body>
    <div class="ds-root" data-theme="wecuratelife"><slot /></div>
  </body>
</html>`

export const NEXT_PAGE = `// src/app/page.tsx (a Server Component)
import { Button } from "@/client/components/button/Button";
import { Select } from "@/client/components/select/Select";

export default function Page() {
  return (
    <main>
      <Button>Get in touch</Button>
      <Select label="Type of project" options={["Residential", "Hospitality"]} />
    </main>
  );
}`

export const ASTRO_PAGE = `---
// src/pages/index.astro
import Layout from "../layouts/Layout.astro";
import { Button } from "../client/components/button/Button";
import { Select } from "../client/components/select/Select";
---
<Layout>
  <Button>Get in touch</Button>
  <Select client:load label="Type of project" options={["Residential", "Hospitality"]} />
</Layout>`
