import {
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

import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";

import type { ClientResponse } from "../../types/client";

type Props = {
  open: boolean;
  client: ClientResponse | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeactivateClientDialog({
  open,
  client,
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

              bgcolor: "rgba(255,255,255,0.06)",
              color: "text.secondary",

              flexShrink: 0,
            }}
          >
            <PersonOffOutlinedIcon />
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
            Деактивувати клієнта?
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
          Клієнта{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {client?.firstName} {client?.lastName}
          </Box>{" "}
          буде деактивовано. Дані клієнта залишаться
          збереженими, а його статус можна буде відновити
          в будь-який момент.
        </DialogContentText>
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
          disabled={loading}
          onClick={onConfirm}
          sx={{
            minWidth: 140,
          }}
        >
          {loading ? (
            <CircularProgress
              size={21}
              color="inherit"
            />
          ) : (
            "Деактивувати"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}