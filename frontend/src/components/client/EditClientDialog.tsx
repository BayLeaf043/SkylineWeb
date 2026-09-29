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
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import { clientService } from "../../services/clientService";

import type {
  ClientResponse,
  UpdateClientRequest,
} from "../../types/client";

interface EditClientDialogProps {
  open: boolean;
  clientId: number | null;
  onClose: () => void;
  onUpdated: () => void;
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

export default function EditClientDialog({
  open,
  clientId,
  onClose,
  onUpdated,
}: EditClientDialogProps) {
  const [client, setClient] =
    useState<ClientResponse | null>(null);

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || clientId === null) {
      return;
    }

    const loadClient = async () => {
      try {
        setLoading(true);
        setError("");
        setClient(null);

        const data =
          await clientService.getById(clientId);

        setClient(data);

        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone ?? "",
          birthDate: data.birthDate ?? "",
        });
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося завантажити дані клієнта"
        );
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [open, clientId]);

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
    if (clientId === null || !client) {
      return;
    }

    if (!isFormValid()) {
      setError(
        "Заповніть усі обов'язкові поля."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: UpdateClientRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
      };

      await clientService.updateClient(
        clientId,
        request
      );

      onUpdated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося зберегти зміни"
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
              Редагувати клієнта
            </Typography>

            {client && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  mt: 0.5,
                }}
              >
                <PersonOutlineRoundedIcon
                  sx={{
                    fontSize: 17,
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {client.firstName}{" "}
                  {client.lastName}
                </Typography>
              </Stack>
            )}
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
        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {client && (
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
                      onChange={handleChange(
                        "firstName"
                      )}
                      required
                    />

                    <TextField
                      label="Прізвище"
                      value={formData.lastName}
                      onChange={handleChange(
                        "lastName"
                      )}
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
                      onChange={handleChange(
                        "phone"
                      )}
                      placeholder="+380..."
                      required
                    />

                    <TextField
                      label="Дата народження"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange(
                        "birthDate"
                      )}
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
            )}
          </Stack>
        )}
      </DialogContent>

      {/* ACTIONS */}

      {!loading && client && (
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
              minWidth: 150,
            }}
          >
            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Зберегти зміни"
            )}
          </Button>
        </DialogActions>
      )}
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