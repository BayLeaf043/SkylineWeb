import type { ReactNode } from "react";

import {
  Box,
  Container,
  Paper,
} from "@mui/material";

interface AuthCardProps {
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg";
}

export default function AuthCard({
  children,
  maxWidth = "sm",
}: AuthCardProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        px: {
          xs: 1,
          sm: 2,
        },

        py: {
          xs: 2,
          sm: 4,
        },
      }}
    >
      <Container
        maxWidth={maxWidth}
        disableGutters
      >
        <Paper
          sx={{
            p: {
              xs: 2.5,
              sm: 4,
            },

            borderRadius: 1.5,

            boxShadow:
              "0 24px 60px rgba(0,0,0,0.28)",
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}