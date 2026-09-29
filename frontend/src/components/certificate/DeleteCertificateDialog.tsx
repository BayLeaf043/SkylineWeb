import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import type { CertificateResponse } from "../../types/certificate";

type Props = {
  open: boolean;
  certificate: CertificateResponse | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteCertificateDialog({
  open,
  certificate,
  loading,
  onClose,
  onConfirm,
}: Props) {
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
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      fullWidth
      maxWidth="xs"
    >
      {/* HEADER */}

      <DialogTitle>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              borderRadius: 1,

              bgcolor: "rgba(244,67,54,0.10)",
              color: "error.main",

              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1.05rem",
                sm: "1.25rem",
              },
            }}
          >
            Видалити сертифікат?
          </Typography>
        </Stack>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          pt: "12px !important",
        }}
      >
        <DialogContentText
          sx={{
            color: "text.secondary",
            lineHeight: 1.65,
          }}
        >
          Сертифікат буде видалено із системи.
          Разом із ним буде видалено пов'язану
          покупку та фінансову операцію продажу.
          Цю дію неможливо скасувати.
        </DialogContentText>

        {/* CERTIFICATE INFO */}

        {certificate && (
          <Box
            sx={{
              mt: 2,
              p: 1.75,

              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,

              bgcolor: "rgba(255,255,255,0.025)",
            }}
          >
            <Stack spacing={1}>
              <InfoRow
                label="Клієнт"
                value={`${certificate.clientFirstName} ${certificate.clientLastName}`}
              />

              <InfoRow
                label="Послуга"
                value={certificate.serviceTitle}
              />

              <InfoRow
                label="Період дії"
                value={`${formatDate(
                  certificate.validFrom
                )} — ${formatDate(
                  certificate.validTo
                )}`}
              />

              <InfoRow
                label="Використано занять"
                value={`${certificate.usedSessions} з ${certificate.totalSessions}`}
              />
            </Stack>
          </Box>
        )}

        {/* WARNING */}

        <Alert
          severity="warning"
          sx={{
            mt: 2,
          }}
        >
          Видаляйте сертифікат лише якщо продаж
          було оформлено помилково. Видалення
          прибере покупку та відповідне
          надходження з фінансової історії, тому
          баланс рахунку буде перераховано.
        </Alert>

        {certificate &&
          certificate.usedSessions > 0 && (
            <Alert
              severity="error"
              sx={{
                mt: 1.5,
              }}
            >
              Цей сертифікат уже
              використовувався. Видалення такого
              сертифіката заборонено.
            </Alert>
          )}
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions>
        <Button
          color="inherit"
          disabled={loading}
          onClick={onClose}
          sx={{
            color: "text.secondary",
          }}
        >
          Скасувати
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={
            loading ||
            !certificate ||
            certificate.usedSessions > 0
          }
          onClick={onConfirm}
          sx={{
            minWidth: 120,
          }}
        >
          {loading ? (
            <CircularProgress
              size={21}
              color="inherit"
            />
          ) : (
            "Видалити"
          )}
        </Button>
      </DialogActions>
    </Dialog>
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
      sx={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          flexShrink: 0,
        }}
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