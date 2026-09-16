import { Box, Button, Typography, } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";


export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <AuthCard>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          color: "primary.main",
          backgroundColor: "rgba(47,140,255,0.12)",
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        S
      </Box>

      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          fontSize: {
            xs: "2rem",
            sm: "2.6rem",
          },
        }}
      >
        Skyline
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          textAlign: "center",
          mt: 1,
          mb: 4,
        }}
      >
        Система управління спортивним комплексом
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate("/login")}
        >
          Я маю акаунт
        </Button>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={() => navigate("/register")}
        >
          Я новий користувач
        </Button>
      </Box>
    </AuthCard>
  );
}