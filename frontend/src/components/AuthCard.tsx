import type { ReactNode } from "react";
import { Box, Container, Paper, } from "@mui/material";

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
        px: 2,
        py: {
          xs: 3,
          sm: 4,
        },
      }}
    >
      <Container maxWidth={maxWidth}>
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },

            borderRadius: "22px",

            background:
              "linear-gradient(180deg, rgba(14, 28, 47, 0.96) 0%, rgba(10, 22, 38, 0.96) 100%)",

            boxShadow:
              "0 30px 80px rgba(0, 0, 0, 0.35)",

            backdropFilter: "blur(16px)",
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}