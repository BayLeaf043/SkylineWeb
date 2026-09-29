import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";

import type {
  ClubProfile,
  Profile,
} from "../types/profile";

export default function SettingsPage() {
  const { refreshUser } = useAuth();

  const [tab, setTab] =
    useState(0);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [club, setClub] =
    useState<ClubProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    savingClub,
    setSavingClub,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // PROFILE FORM

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  // CLUB FORM

  const [clubTitle, setClubTitle] =
    useState("");

  const [city, setCity] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [clubPhone, setClubPhone] =
    useState("");

  const [clubEmail, setClubEmail] =
    useState("");

  const [description, setDescription] =
    useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          profileData,
          clubData,
        ] = await Promise.all([
          profileService.getProfile(),
          profileService.getClub(),
        ]);

        setProfile(profileData);
        setClub(clubData);

        // PROFILE

        setFirstName(
          profileData.firstName
        );

        setLastName(
          profileData.lastName
        );

        setPhone(
          profileData.phone ?? ""
        );

        setBirthDate(
          profileData.birthDate ?? ""
        );

        // CLUB

        setClubTitle(
          clubData.title
        );

        setCity(
          clubData.city ?? ""
        );

        setAddress(
          clubData.address ?? ""
        );

        setClubPhone(
          clubData.phone ?? ""
        );

        setClubEmail(
          clubData.email ?? ""
        );

        setDescription(
          clubData.description ?? ""
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити налаштування"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSaveProfile =
    async () => {
      clearMessages();

      const trimmedFirstName =
        firstName.trim();

      const trimmedLastName =
        lastName.trim();

      if (!trimmedFirstName) {
        setError("Вкажіть ім'я");
        return;
      }

      if (!trimmedLastName) {
        setError(
          "Вкажіть прізвище"
        );
        return;
      }

      try {
        setSavingProfile(true);

        const updatedProfile =
          await profileService.updateProfile(
            {
              firstName:
                trimmedFirstName,

              lastName:
                trimmedLastName,

              phone:
                phone.trim() || null,

              birthDate:
                birthDate || null,
            }
          );

        await refreshUser();

        setProfile(updatedProfile);

        setFirstName(
          updatedProfile.firstName
        );

        setLastName(
          updatedProfile.lastName
        );

        setPhone(
          updatedProfile.phone ?? ""
        );

        setBirthDate(
          updatedProfile.birthDate ?? ""
        );

        setSuccess(
          "Особисті дані успішно збережено"
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося зберегти профіль"
        );
      } finally {
        setSavingProfile(false);
      }
    };

  const handleSaveClub =
    async () => {
      clearMessages();

      const trimmedTitle =
        clubTitle.trim();

      if (!trimmedTitle) {
        setError(
          "Вкажіть назву спортивного комплексу"
        );
        return;
      }

      try {
        setSavingClub(true);

        const updatedClub =
          await profileService.updateClub(
            {
              title:
                trimmedTitle,

              city:
                city.trim() || null,

              address:
                address.trim() || null,

              phone:
                clubPhone.trim() ||
                null,

              email:
                clubEmail.trim() ||
                null,

              description:
                description.trim() ||
                null,
            }
          );

        await refreshUser();

        setClub(updatedClub);

        setClubTitle(
          updatedClub.title
        );

        setCity(
          updatedClub.city ?? ""
        );

        setAddress(
          updatedClub.address ?? ""
        );

        setClubPhone(
          updatedClub.phone ?? ""
        );

        setClubEmail(
          updatedClub.email ?? ""
        );

        setDescription(
          updatedClub.description ?? ""
        );

        setSuccess(
          "Інформацію про спортивний комплекс успішно збережено"
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося зберегти інформацію про клуб"
        );
      } finally {
        setSavingClub(false);
      }
    };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
      }}
    >
      {/* PAGE HEADER */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,

            fontSize: {
              xs: "1.75rem",
              sm: "2.125rem",
            },
          }}
        >
          Налаштування
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 650,
          }}
        >
          Керуйте особистими даними та
          інформацією про спортивний
          комплекс.
        </Typography>
      </Box>

      {/* TABS */}

      <Box
        sx={{
          mb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, newValue) => {
            setTab(newValue);
            clearMessages();
          }}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile
        >
          <Tab
            icon={
              <PersonOutlinedIcon />
            }
            iconPosition="start"
            label="Мій профіль"
            sx={{
              minHeight: 52,
            }}
          />

          <Tab
            icon={
              <BusinessOutlinedIcon />
            }
            iconPosition="start"
            label="Спортивний комплекс"
            sx={{
              minHeight: 52,
            }}
          />
        </Tabs>
      </Box>

      {/* MESSAGES */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
        >
          {success}
        </Alert>
      )}

      {/* PROFILE */}

      {tab === 0 && profile && (
        <Paper
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },

            borderRadius: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Особиста інформація
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              mb: 3,
            }}
          >
            Основні дані вашого профілю.
          </Typography>

          {/* PERSONAL DATA */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },

              gap: 2,
            }}
          >
            <TextField
              label="Ім'я"
              value={firstName}
              onChange={(event) =>
                setFirstName(
                  event.target.value
                )
              }
              required
              disabled={savingProfile}
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            <TextField
              label="Прізвище"
              value={lastName}
              onChange={(event) =>
                setLastName(
                  event.target.value
                )
              }
              required
              disabled={savingProfile}
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            <TextField
              label="Телефон"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              disabled={savingProfile}
              placeholder="+380..."
              slotProps={{
                htmlInput: {
                  maxLength: 30,
                },
              }}
            />

            <TextField
              label="Дата народження"
              type="date"
              value={birthDate}
              onChange={(event) =>
                setBirthDate(
                  event.target.value
                )
              }
              disabled={savingProfile}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Box>

          {/* ACCOUNT INFO */}

          <Box
            sx={{
              mt: 4,
              pt: 3,

              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Обліковий запис
            </Typography>

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },

                gap: 2,
              }}
            >
              <TextField
                label="Email"
                value={profile.email}
                disabled
                helperText="Email використовується для входу в систему"
              />

              <TextField
                label="Роль"
                value={
                  profile.role ===
                  "ADMIN"
                    ? "Адміністратор"
                    : "Тренер"
                }
                disabled
                helperText="Роль визначає доступ до функцій системи"
              />
            </Box>
          </Box>

          {/* PROFILE ACTION */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            sx={{
              mt: 3.5,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              startIcon={
                savingProfile
                  ? undefined
                  : <SaveOutlinedIcon />
              }
              onClick={
                handleSaveProfile
              }
              disabled={savingProfile}
              sx={{
                minWidth: 180,

                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              {savingProfile ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                "Зберегти зміни"
              )}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* CLUB */}

      {tab === 1 && club && (
        <Paper
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },

            borderRadius: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Інформація про спортивний
            комплекс
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              mb: 3,
            }}
          >
            Контактна та основна інформація
            вашого клубу.
          </Typography>

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },

              gap: 2,
            }}
          >
            <TextField
              label="Назва"
              value={clubTitle}
              onChange={(event) =>
                setClubTitle(
                  event.target.value
                )
              }
              required
              disabled={savingClub}
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                },
              }}
              sx={{
                gridColumn: {
                  md: "1 / -1",
                },
              }}
            />

            <TextField
              label="Місто"
              value={city}
              onChange={(event) =>
                setCity(
                  event.target.value
                )
              }
              disabled={savingClub}
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            <TextField
              label="Адреса"
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value
                )
              }
              disabled={savingClub}
              slotProps={{
                htmlInput: {
                  maxLength: 255,
                },
              }}
            />

            <TextField
              label="Телефон"
              value={clubPhone}
              onChange={(event) =>
                setClubPhone(
                  event.target.value
                )
              }
              disabled={savingClub}
              placeholder="+380..."
              slotProps={{
                htmlInput: {
                  maxLength: 30,
                },
              }}
            />

            <TextField
              label="Email"
              type="email"
              value={clubEmail}
              onChange={(event) =>
                setClubEmail(
                  event.target.value
                )
              }
              disabled={savingClub}
              slotProps={{
                htmlInput: {
                  maxLength: 255,
                },
              }}
            />

            <TextField
              label="Опис"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              multiline
              minRows={4}
              disabled={savingClub}
              placeholder="Коротко розкажіть про спортивний комплекс"
              slotProps={{
                htmlInput: {
                  maxLength: 1000,
                },
              }}
              sx={{
                gridColumn: {
                  md: "1 / -1",
                },
              }}
            />
          </Box>

          {/* CLUB ACTION */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            sx={{
              mt: 3.5,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              startIcon={
                savingClub
                  ? undefined
                  : <SaveOutlinedIcon />
              }
              onClick={handleSaveClub}
              disabled={savingClub}
              sx={{
                minWidth: 180,

                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              {savingClub ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                "Зберегти зміни"
              )}
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}