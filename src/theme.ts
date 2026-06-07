import { createTheme, alpha } from "@mui/material/styles";

// Brand palette shared with the CSS shell. EnkelTrain uses a teal -> blue
// accent gradient on a deep, near-black background.
export const brand = {
  bg: "#0a0c11",
  panel: "#11141b",
  panel2: "#151922",
  elevated: "#1a1f2a",
  line: "#242b38",
  lineSoft: "#1d232e",
  text: "#eef1f7",
  muted: "#97a1b4",
  faint: "#6a7486",
  teal: "#5eead4",
  emerald: "#34d399",
  blue: "#60a5fa",
  danger: "#f87171",
  warn: "#fbbf24",
  gradient: "linear-gradient(135deg, #5eead4 0%, #60a5fa 100%)"
};

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: brand.blue, contrastText: "#06121b" },
    secondary: { main: brand.emerald, contrastText: "#06121b" },
    success: { main: brand.emerald },
    warning: { main: brand.warn },
    error: { main: brand.danger },
    background: { default: brand.bg, paper: brand.panel },
    text: { primary: brand.text, secondary: brand.muted },
    divider: brand.line
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: "1.12rem", fontWeight: 800, letterSpacing: "-0.01em" },
    h2: { fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em" },
    button: { textTransform: "none", fontWeight: 650 }
  },
  transitions: {
    easing: { easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)" }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 40,
          transition: "transform 120ms ease, filter 140ms ease, background 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
          "&:active": { transform: "translateY(1px)" }
        }
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            background: brand.gradient,
            color: "#06121b",
            fontWeight: 750,
            boxShadow: "0 10px 26px -14px rgba(94, 234, 212, 0.8)",
            "&:hover": { background: brand.gradient, filter: "brightness(1.06)" }
          }
        }
      ]
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#0c0f15",
          borderRadius: 10,
          transition: "box-shadow 140ms ease, border-color 140ms ease",
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px ${alpha(brand.blue, 0.16)}`
          }
        },
        notchedOutline: { borderColor: brand.line }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: brand.elevated,
          border: `1px solid ${brand.line}`,
          fontSize: "0.72rem"
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 }
      }
    }
  }
});

export default theme;
