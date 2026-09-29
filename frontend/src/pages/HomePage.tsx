import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  const roleName =
    user?.role === "ADMIN"
      ? "Адміністратор"
      : "Тренер";

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontSize: {
            xs: "1.8rem",
            md: "2rem",
          },
        }}
      >
        Вітаємо, {user?.firstName}! 👋
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.7,
          mb: 3,
        }}
      >
        Гарного дня! Ось що відбувається у вашому комплексі сьогодні.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "14px",
          maxWidth: 520,
        }}
      >
        <Typography variant="h6">
          Ваш профіль
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.6,
          }}
        >
          <Typography>
            {user?.firstName} {user?.lastName}
          </Typography>

          <Typography color="text.secondary">
            {roleName}
          </Typography>

          <Typography color="text.secondary">
            {user?.clubName}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}