import {
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useNavigate,
} from "react-router-dom";

import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const isFormValid =
    email.trim().length > 0 &&
    password.length > 0;

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError(
        "Введіть email та пароль"
      );
      return;
    }

    try {
      setSubmitting(true);

      await login(
        email.trim(),
        password
      );

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося виконати вхід"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard>
      {/* HEADER */}

      <Box
        sx={{
          textAlign: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,

            fontSize: {
              xs: "1.75rem",
              sm: "2.125rem",
            },
          }}
        >
          Вхід
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          Увійдіть до свого акаунта
        </Typography>
      </Box>

      {/* FORM */}

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();

          if (
            !submitting &&
            isFormValid
          ) {
            handleLogin();
          }
        }}
      >
        <Stack spacing={2}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            disabled={submitting}
            required
            autoComplete="email"
          />

          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            disabled={submitting}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={
              submitting ||
              !isFormValid
            }
            sx={{
              mt: "8px !important",
            }}
          >
            {submitting ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Увійти"
            )}
          </Button>

          <Button
            type="button"
            color="inherit"
            onClick={() =>
              navigate("/")
            }
            disabled={submitting}
            sx={{
              color: "text.secondary",
            }}
          >
            Назад
          </Button>
        </Stack>
      </Box>
    </AuthCard>
  );
}