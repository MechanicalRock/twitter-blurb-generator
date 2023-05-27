import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      light: "#98c1d9",
      main: "#3d5a80",
      dark: "#293241",
    },
    secondary: {
      main: "#ee6c4d",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: ({ theme }) => ({
          boxShadow: "none",
          backgroundColor: theme.palette.primary.main + " !important",
          borderRadius: "2em",
          minHeight: "3em",
        }),
        sizeMedium: {
          minHeight: "1.5em",
        },
      },
    },
  },
});

export default theme;
