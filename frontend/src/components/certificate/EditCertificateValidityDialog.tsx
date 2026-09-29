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
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";

import { certificateService } from "../../services/certificateService";

import type {
  CertificateResponse,
  UpdateCertificateValidityRequest,
} from "../../types/certificate";

interface EditCertificateValidityDialogProps {
  open: boolean;
  certificateId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface FormData {
  validTo: string;
}

const initialFormData: FormData = {
  validTo: "",
};

export default function EditCertificateValidityDialog({
  open,
  certificateId,
  onClose,
  onUpdated,
}: EditCertificateValidityDialogProps) {
  const [certificate, setCertificate] =
    useState<CertificateResponse | null>(null);

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || certificateId === null) {
      return;
    }

    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError("");
        setCertificate(null);

        const data =
          await certificateService.getById(
            certificateId
          );

        setCertificate(data);

        setFormData({
          validTo: data.validTo,
        });
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося завантажити дані сертифіката"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [open, certificateId]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      validTo: event.target.value,
    });
  };

  const isFormValid = () => {
    if (!certificate || !formData.validTo) {
      return false;
    }

    return (
      formData.validTo >= certificate.validFrom
    );
  };

  const hasChanges =
    certificate !== null &&
    formData.validTo !== certificate.validTo;

  const handleSubmit = async () => {
    if (
      certificateId === null ||
      !certificate
    ) {
      return;
    }

    if (!formData.validTo) {
      setError(
        "Вкажіть дату закінчення дії сертифіката."
      );
      return;
    }

    if (
      formData.validTo <
      certificate.validFrom
    ) {
      setError(
        "Дата закінчення дії не може бути раніше дати початку дії сертифіката."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: UpdateCertificateValidityRequest =
        {
          validTo: formData.validTo,
        };

      await certificateService.updateValidity(
        certificateId,
        request
      );

      onUpdated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося змінити термін дії сертифіката"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(
      "uk-UA"
    ).format(
      new Date(`${date}T00:00:00`)
    );
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
              Змінити термін дії
            </Typography>

            {certificate && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  mt: 0.5,
                }}
              >
                <EditCalendarOutlinedIcon
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
                  {certificate.clientFirstName}{" "}
                  {certificate.clientLastName}
                  {" · "}
                  {certificate.serviceTitle}
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

            {certificate && (
              <>
                {/* CERTIFICATE INFO */}

                <Box>
                  <SectionTitle>
                    Сертифікат
                  </SectionTitle>

                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1.5,
                    }}
                  >
                    <Stack spacing={1.25}>
                      <InfoRow
                        label="Клієнт"
                        value={`${certificate.clientFirstName} ${certificate.clientLastName}`}
                      />

                      <InfoRow
                        label="Послуга"
                        value={
                          certificate.serviceTitle
                        }
                      />

                      <InfoRow
                        label="Дата початку"
                        value={formatDate(
                          certificate.validFrom
                        )}
                      />

                      <InfoRow
                        label="Поточна дата завершення"
                        value={formatDate(
                          certificate.validTo
                        )}
                      />

                      <InfoRow
                        label="Залишилось занять"
                        value={`${certificate.remainingSessions} з ${certificate.totalSessions}`}
                      />
                    </Stack>
                  </Box>
                </Box>

                {/* VALIDITY */}

                <Box>
                  <SectionTitle>
                    Новий термін дії
                  </SectionTitle>

                  <TextField
                    label="Дата закінчення"
                    type="date"
                    value={formData.validTo}
                    onChange={handleChange}
                    required
                    fullWidth
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },

                      htmlInput: {
                        min: certificate.validFrom,
                      },
                    }}
                    helperText={
                      "Дата не може бути раніше дати початку дії сертифіката"
                    }
                  />
                </Box>

                {/* EXPIRED INFO */}

                {certificate.type ===
                  "EXPIRED" && (
                  <Alert severity="info">
                    Якщо встановити актуальну або
                    майбутню дату завершення і в
                    сертифікаті залишилися заняття,
                    його статус буде автоматично
                    змінено на активний.
                  </Alert>
                )}
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* ACTIONS */}

      {!loading && certificate && (
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
              saving ||
              !isFormValid() ||
              !hasChanges
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}