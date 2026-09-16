import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",

    background: {
      default: "#07111f",
      paper: "#0d1a2b",
    },

    primary: {
      main: "#2f8cff",
    },

    text: {
      primary: "#f5f8fc",
      secondary: "#92a3b9",
    },

    divider: "rgba(255,255,255,0.08)",
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.08)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 12,
          boxShadow: "none",
        },

        contained: {
          "&.MuiButton-colorPrimary": {
            backgroundColor: "#2f8cff",

            "&:hover": {
              backgroundColor: "#1f7ce8",
              boxShadow: "none",
            },
          },
        },

        outlined: {
          borderColor: "rgba(255,255,255,0.14)",

          "&:hover": {
            borderColor: "#2f8cff",
            backgroundColor: "rgba(47,140,255,0.08)",
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.025)",

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.10)",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.20)",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2f8cff",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#92a3b9",

          "&.Mui-focused": {
            color: "#2f8cff",
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});