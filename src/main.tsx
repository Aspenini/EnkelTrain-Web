import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import App from "./App";

const container = document.querySelector<HTMLDivElement>("#app");
if (!container) {
  throw new Error("Missing #app root");
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
