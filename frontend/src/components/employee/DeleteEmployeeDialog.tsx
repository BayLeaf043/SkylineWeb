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

import type { EmployeeResponse } from "../../types/employee";

type Props = {
  open: boolean;
  employee: EmployeeResponse | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteEmployeeDialog({
  open,
  employee,
  loading,
  onClose,
  onConfirm,
}: Props) {
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
            Видалити працівника?
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
          Працівника{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {employee?.firstName} {employee?.lastName}
          </Box>{" "}
          буде видалено із системи. Цю дію неможливо
          скасувати.
        </DialogContentText>

        <Alert
          severity="warning"
          sx={{
            mt: 2,
          }}
        >
          Видаляйте працівника лише якщо його було
          створено помилково. Для припинення роботи
          працівника використовуйте деактивацію.
        </Alert>
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
          disabled={loading}
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