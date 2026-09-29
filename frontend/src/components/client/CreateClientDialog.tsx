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
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";

import { clientService } from "../../services/clientService";

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: "",
};

export default function CreateClientDialog({
  open,
  onClose,
  onCreated,
}: CreateClientDialogProps) {
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
  }, [open]);

  const handleChange =
    (field: keyof FormData) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const isFormValid = () => {
    return Boolean(
      formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.phone.trim() &&
        formData.birthDate
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Заповніть усі обов'язкові поля.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await clientService.createClient({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
      });

      onCreated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося створити клієнта"
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
              Додати клієнта
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: "flex-start",
                mt: 0.5,
              }}
            >
              <PersonAddAltOutlinedIcon
                sx={{
                  mt: 0.15,
                  fontSize: 17,
                  color: "primary.main",
                  flexShrink: 0,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Дані нового клієнта спортивного комплексу
              </Typography>
            </Stack>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            size="small"
            sx={{
              color: "text.secondary",
              flexShrink: 0,
            }}
            aria-label="Закрити"
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