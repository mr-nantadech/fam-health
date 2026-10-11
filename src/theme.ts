"use client";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#0E6B64", contrastText: "#ffffff" },
    secondary: { main: "#B4532A" },
    error: { main: "#B42318" },
    background: { default: "#f3f6f4", paper: "#ffffff" },
    text: { primary: "#16302c", secondary: "#5c6f6b" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-anuphan), Anuphan, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiSelect: {
      defaultProps: { IconComponent: ArrowDropDownIcon },
      styleOverrides: {
        icon: {
          display: "inline-block",
          width: 24,
          height: 24,
          color: "#3d5550",
        },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 16 } },
    },
  },
});
