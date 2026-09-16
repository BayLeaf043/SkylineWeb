import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, TextField, Typography, } from "@mui/material";
import AuthCard from "../components/AuthCard";
import { useNavigate } from "react-router-dom";

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (
      !form.clubName.trim() ||
      !form.city.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Заповніть усі обов'язкові поля");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    if (form.password.length < 8) {
      setError("Пароль повинен містити щонайменше 8 символів");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

    if (!passwordRegex.test(form.password)) {
      setError(
        "Пароль повинен містити щонайменше 8 символів, велику та малу літеру і цифру"
      );
      return;
    }

    try {
      setSubmitting(true);

      await registerClub({
        clubName: form.clubName.trim(),
        city: form.city.trim(),

        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),

        email: form.email.trim(),
        password: form.password,
      });

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не вдалося виконати реєстрацію");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <AuthCard maxWidth="md">
    <Typography
      variant="h4"
      sx={{
        textAlign: "center",
        mb: 1,
      }}
    >
      Створення клубу
    </Typography>

    <Typography
      color="text.secondary"
      sx={{
        textAlign: "center",
        mb: 4,
      }}
    >
      Створіть спортивний клуб та акаунт адміністратора
    </Typography>

    {error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}

    <Typography
      variant="h6"
      sx={{
        mb: 2,
      }}
    >
      Дані клубу
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
      />

      <TextField
        label="Місто"
        name="city"
        value={form.city}
        onChange={handleChange}
        required
      />
    </Box>

    <Divider sx={{ my: 4 }} />

    <Typography
      variant="h6"
      sx={{
        mb: 2,
      }}
    >
      Дані адміністратора
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
      />

      <TextField
        label="Прізвище"
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        required
      />

      <TextField
        label="Email для входу"
        name="email"
        value={form.email}
        onChange={handleChange}
        type="email"
        required
        sx={{
          gridColumn: {
            xs: "auto",
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
      />

      <TextField
        label="Повторіть пароль"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        type="password"
        required
      />
    </Box>

    <Box
      sx={{
        mt: 4,
        display: "flex",
        flexDirection: {
          xs: "column-reverse",
          sm: "row",
        },
        gap: 2,
      }}
    >
      <Button
        variant="outlined"
        size="large"
        fullWidth
        disabled={submitting}
        onClick={() => navigate("/")}
      >
        Назад
      </Button>

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? (
          <CircularProgress size={24} />
        ) : (
          "Створити клуб"
        )}
      </Button>
    </Box>
  </AuthCard>
);
}