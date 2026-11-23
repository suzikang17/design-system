import { lazy, Suspense } from "react"
import { Outlet, Route, Routes } from "react-router-dom"

import { CatalogLayout, Layout } from "./Layout"
import { ThemeProvider } from "./theme"

const Landing = lazy(() => import("./pages/Landing"))
const ComponentsIndex = lazy(() => import("./pages/ComponentsIndex"))
const ComponentDetail = lazy(() => import("./pages/ComponentDetail"))
const Inspiration = lazy(() => import("./pages/Inspiration"))
const NotFound = lazy(() => import("./pages/NotFound"))

const ClientLayout = lazy(() => import("./client/ClientLayout"))
const ClientIndex = lazy(() => import("./client/ClientIndex"))
const ClientPiece = lazy(() => import("./client/ClientPiece"))
const ClientStyles = lazy(() => import("./client/ClientStyles"))
const ClientUsing = lazy(() => import("./client/ClientUsing"))
const ClientNotFound = lazy(() => import("./client/ClientNotFound"))
const ClientPreview = lazy(() => import("./client/ClientPreview"))

/** The site's theme applies to every page in the site's chrome, and nowhere else. */
function ThemedSite() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}

export function App() {
  return (
    <Routes>
      {/* The bare piece inside a client page's preview frame: no chrome, and no site theme on <html>. */}
      <Route
        path="client/preview/:id"
        element={
          <Suspense fallback={null}>
            <ClientPreview />
          </Suspense>
        }
      />
      <Route element={<ThemedSite />}>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="components" element={<CatalogLayout />}>
            <Route index element={<ComponentsIndex />} />
            <Route path=":name" element={<ComponentDetail />} />
          </Route>
          <Route path="client" element={<ClientLayout />}>
            <Route index element={<ClientIndex />} />
            <Route path="using" element={<ClientUsing />} />
            <Route path="styles/:page" element={<ClientStyles />} />
            <Route path=":id" element={<ClientPiece />} />
            <Route path="*" element={<ClientNotFound />} />
          </Route>
          <Route path="inspiration" element={<Inspiration />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
