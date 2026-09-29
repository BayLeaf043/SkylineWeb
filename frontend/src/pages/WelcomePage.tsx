import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <AuthCard>
      {/* LOGO */}

      <Box
        sx={{
          width: 48,
          height: 48,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          mx: "auto",
          mb: 2,

          borderRadius: 1.5,

          bgcolor:
            "rgba(47,140,255,0.12)",

          color: "primary.main",

          fontSize: 26,
          fontWeight: 700,
        }}
      >
        S
      </Box>

      {/* HEADER */}

      <Box
        sx={{
          textAlign: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,

            fontSize: {
              xs: "2rem",
              sm: "2.5rem",
            },
          }}
        >
          Skyline
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          Система управління спортивним
          комплексом
        </Typography>
      </Box>

      {/* ACTIONS */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={() =>
            navigate("/login")
          }
        >
          Я маю акаунт
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={() =>
            navigate("/register")
          }
        >
          Я новий користувач
        </Button>
      </Stack>
    </AuthCard>
  );
}