import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";

import { employeeService } from "../../services/employeeService";

export type EmployeeType = "ADMIN" | "TRAINER";

interface CreateEmployeeDialogProps {
  open: boolean;
  type: EmployeeType | null;
  onClose: () => void;
  onBack: () => void;
  onCreated: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  specialization: string;
  experienceYears: string;
  description: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: "",
  specialization: "",
  experienceYears: "",
  description: "",
};

export default function CreateEmployeeDialog({
  open,
  type,
  onClose,
  onBack,
  onCreated,
}: CreateEmployeeDialogProps) {
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setError("");
    }
  }, [open, type]);

  if (!type) {
    return null;
  }

  const isTrainer = type === "TRAINER";

  const handleChange =
    (field: keyof FormData) =>
    (
      event:
        React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const isFormValid = () => {
    const baseValid =
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.phone.trim() &&
      formData.birthDate;

    if (!baseValid) {
      return false;
    }

    if (isTrainer) {
      return Boolean(
        formData.specialization.trim() &&
          formData.experienceYears !== "" &&
          formData.description.trim()
      );
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Заповніть усі обов'язкові поля.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isTrainer) {
        await employeeService.createTrainer({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          birthDate: formData.birthDate,
          specialization:
            formData.specialization.trim(),
          experienceYears: Number(
            formData.experienceYears
          ),
          description:
            formData.description.trim(),
        });
      } else {
        await employeeService.createAdmin({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          birthDate: formData.birthDate,
        });
      }

      onCreated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося створити працівника"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      {/* HEADER */}

      <DialogTitle>
        <Stack
          direction="row"
          spacing={{
            xs: 1,
            sm: 2,
          }}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Stack
            direction="row"
            spacing={{
              xs: 1,
              sm: 1.5,
            }}
            sx={{
              alignItems: "flex-start",
              minWidth: 0,
            }}
          >
            <IconButton
              onClick={onBack}
              disabled={saving}
              size="small"
              sx={{
                mt: 0.15,
                color: "text.secondary",
                flexShrink: 0,
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: {
                    xs: "1.15rem",
                    sm: "1.5rem",
                  },
                }}
              >
                {isTrainer
                  ? "Додати тренера"
                  : "Додати адміністратора"}
              </Typography>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "flex-start",
                  mt: 0.5,
                }}
              >
                {isTrainer ? (
                  <FitnessCenterOutlinedIcon
                    sx={{
                      mt: 0.15,
                      fontSize: 17,
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <AdminPanelSettingsOutlinedIcon
                    sx={{
                      mt: 0.15,
                      fontSize: 17,
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  />
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {isTrainer
                    ? "Дані нового тренера спортивного комплексу"
                    : "Дані нового адміністратора системи"}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={saving}
            size="small"
            sx={{
              color: "text.secondary",
              flexShrink: 0,
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          pt: "20px !important",
        }}
      >
        <Stack spacing={3}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* PERSONAL DATA */}

          <Box>
            <SectionTitle>
              Особисті дані
            </SectionTitle>

            <Stack spacing={2}>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <TextField
                  label="Ім'я"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  required
                />

                <TextField
                  label="Прізвище"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  required
                />
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <TextField
                  label="Номер телефону"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  placeholder="+380..."
                  required
                />

                <TextField
                  label="Дата народження"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange("birthDate")}
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          {/* TRAINER DATA */}

          {isTrainer && (
            <Box>
              <SectionTitle>
                Дані тренера
              </SectionTitle>

              <Stack spacing={2}>
                <TextField
                  label="Спеціалізація"
                  value={formData.specialization}
                  onChange={handleChange(
                    "specialization"
                  )}
                  placeholder="Наприклад: Pole Sport, Aerial Hoop"
                  required
                />

                <TextField
                  label="Досвід роботи"
                  type="number"
                  value={formData.experienceYears}
                  onChange={handleChange(
                    "experienceYears"
                  )}
                  required
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 80,
                    },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          років
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Опис"
                  value={formData.description}
                  onChange={handleChange(
                    "description"
                  )}
                  placeholder="Коротка інформація про тренера"
                  required
                  multiline
                  minRows={3}
                />
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
          color="inherit"
          sx={{
            color: "text.secondary",
          }}
        >
          Скасувати
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            saving || !isFormValid()
          }
          sx={{
            minWidth: 130,
          }}
        >
          {saving ? (
            <CircularProgress
              size={22}
              color="inherit"
            />
          ) : (
            "Додати"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Typography
      variant="body2"
      sx={{
        mb: 1.25,
        fontWeight: 700,
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
  );
}