import {
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useNavigate,
} from "react-router-dom";

import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function RegisterClubPage() {
  const navigate = useNavigate();
  const { registerClub } = useAuth();

  const [form, setForm] = useState({
    clubName: "",
    city: "",

    firstName: "",
    lastName: "",

    email: "",
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid =
    form.clubName.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length > 0 &&
    form.confirmPassword.length > 0;

  const handleSubmit = async () => {
    setError("");

    if (!isFormValid) {
      setError(
        "Заповніть усі обов'язкові поля"
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Паролі не співпадають"
      );
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

    if (
      !passwordRegex.test(
        form.password
      )
    ) {
      setError(
        "Пароль повинен містити щонайменше 8 символів, велику та малу літеру і цифру"
      );
      return;
    }

    try {
      setSubmitting(true);

      await registerClub({
        clubName:
          form.clubName.trim(),

        city:
          form.city.trim(),

        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email.trim(),

        password:
          form.password,
      });

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося виконати реєстрацію"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard maxWidth="md">
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
          Створення клубу
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          Створіть спортивний клуб та
          акаунт адміністратора
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
            handleSubmit();
          }
        }}
      >
        <Stack spacing={3}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* CLUB */}

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Дані клубу
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              Основна інформація про
              спортивний комплекс.
            </Typography>

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },

                gap: 2,
              }}
            >
              <TextField
                label="Назва клубу"
                name="clubName"
                value={form.clubName}
                onChange={handleChange}
                required
                disabled={submitting}
                autoComplete="organization"
                slotProps={{
                  htmlInput: {
                    maxLength: 150,
                  },
                }}
              />

              <TextField
                label="Місто"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                disabled={submitting}
                autoComplete="address-level2"
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* ADMIN */}

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Дані адміністратора
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              Створіть обліковий запис
              адміністратора клубу.
            </Typography>

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },

                gap: 2,
              }}
            >
              <TextField
                label="Ім'я"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                disabled={submitting}
                autoComplete="given-name"
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
              />

              <TextField
                label="Прізвище"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                disabled={submitting}
                autoComplete="family-name"
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
              />

              <TextField
                label="Email для входу"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
                disabled={submitting}
                autoComplete="email"
                slotProps={{
                  htmlInput: {
                    maxLength: 255,
                  },
                }}
                sx={{
                  gridColumn: {
                    sm: "1 / -1",
                  },
                }}
              />

              <TextField
                label="Пароль"
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                required
                disabled={submitting}
                autoComplete="new-password"
                helperText="Мінімум 8 символів, велика та мала літера і цифра"
                slotProps={{
                  htmlInput: {
                    maxLength: 72,
                  },
                }}
              />

              <TextField
                label="Повторіть пароль"
                name="confirmPassword"
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                type="password"
                required
                disabled={submitting}
                autoComplete="new-password"
                slotProps={{
                  htmlInput: {
                    maxLength: 72,
                  },
                }}
              />
            </Box>
          </Box>

          {/* ACTIONS */}

          <Stack
            direction={{
              xs: "column-reverse",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              pt: 1,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              disabled={submitting}
              onClick={() =>
                navigate("/")
              }
              fullWidth
              sx={{
                color: "text.secondary",
              }}
            >
              Назад
            </Button>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={
                submitting ||
                !isFormValid
              }
            >
              {submitting ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                "Створити клуб"
              )}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </AuthCard>
  );
}