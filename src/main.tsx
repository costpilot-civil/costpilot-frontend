import React from "react";
import ReactDOM from "react-dom/client";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import App from "./app";
import { theme } from "./styles/theme";
import "./styles/global.css";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
).render(
  <React.StrictMode>
    <MantineProvider theme={theme} forceColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
