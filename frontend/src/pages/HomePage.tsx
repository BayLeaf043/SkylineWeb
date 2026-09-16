import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    await logout();

    navigate("/", {
      replace: true,
    });
  };

  const roleName =
    user?.role === "ADMIN"
      ? "Адміністратор"
      : "Тренер";

  return (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
    }}
  >
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "rgba(10, 22, 38, 0.92)",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(16px)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            minHeight: {
              xs: 64,
              md: 72,
            },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
              color: "primary.main",
              bgcolor: "rgba(47,140,255,0.12)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            S
          </Box>

          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
            }}
          >
            Skyline
          </Typography>

          <Button
            variant="text"
            color="inherit"
            onClick={handleLogout}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            Вийти
          </Button>
        </Toolbar>
      </Container>
    </AppBar>

    <Container maxWidth="lg">
      <Box
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              xs: "1.8rem",
              md: "2.3rem",
            },
          }}
        >
          Вітаємо, {user?.firstName}! 👋
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            mb: 4,
          }}
        >
          {user?.clubName}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
            },
            borderRadius: "16px",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6">
            Ваш профіль
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
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
    </Container>
  </Box>
);
}