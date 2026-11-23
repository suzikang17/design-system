import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { App } from "@/site/App"
import "./index.css"

// Every theme file, so adding a theme needs no import here.
import.meta.glob("./styles/themes/*.css", { eager: true })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
