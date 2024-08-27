import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import i18n from "./i18n";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { TranslateWrapper } from "./context/Translation";
import { BrowserRouter as Router } from "react-router-dom";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
const theme = createTheme({
  palette: {
    primary: {
      main: "#212529",
    },
  },
});

root.render(
  <React.StrictMode>
    <Router basename="/">
      <TranslateWrapper i18n={i18n}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </TranslateWrapper>
    </Router>
  </React.StrictMode>
);
