import { lazy } from "react"
import { Route, Routes } from "react-router-dom"

import { CatalogLayout, Layout } from "./Layout"
import { ThemeProvider } from "./theme"

const Landing = lazy(() => import("./pages/Landing"))
const ComponentsIndex = lazy(() => import("./pages/ComponentsIndex"))
const ComponentDetail = lazy(() => import("./pages/ComponentDetail"))
const Inspiration = lazy(() => import("./pages/Inspiration"))
const NotFound = lazy(() => import("./pages/NotFound"))

export function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="components" element={<CatalogLayout />}>
            <Route index element={<ComponentsIndex />} />
            <Route path=":name" element={<ComponentDetail />} />
          </Route>
          <Route path="inspiration" element={<Inspiration />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}
