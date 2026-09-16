import { useState } from "react";
import { Alert, Button, CircularProgress, TextField, Typography, } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Введіть email та пароль");
      return;
    }

    try {
      setSubmitting(true);

      await login(email.trim(), password);

      navigate("/home", { replace: true });

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не вдалося виконати вхід");
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
  <AuthCard>
    <Typography
      variant="h4"
      sx={{
        textAlign: "center",
        mb: 1,
      }}
    >
      Вхід
    </Typography>

    <Typography
      color="text.secondary"
      sx={{
        textAlign: "center",
        mb: 4,
      }}
    >
      Увійдіть до свого акаунта
    </Typography>

    {error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}

    <TextField
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      disabled={submitting}
    />

    <TextField
      label="Пароль"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      disabled={submitting}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !submitting) {
          handleLogin();
        }
      }}
      sx={{ mt: 2 }}
    />

    <Button
      variant="contained"
      size="large"
      fullWidth
      disabled={submitting}
      onClick={handleLogin}
      sx={{ mt: 3 }}
    >
      {submitting ? (
        <CircularProgress size={24} />
      ) : (
        "Увійти"
      )}
    </Button>

    <Button
      variant="text"
      fullWidth
      onClick={() => navigate("/")}
      sx={{
        mt: 2,
        color: "text.secondary",
      }}
    >
      Назад
    </Button>
  </AuthCard>
);
}