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

import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";

import type { Hall } from "../../types/hall";

type Props = {
  open: boolean;
  hall: Hall | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeactivateHallDialog({
  open,
  hall,
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
            <MeetingRoomOutlinedIcon />
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
            Деактивувати зал?
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
          Зал{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {hall?.title}
          </Box>{" "}
          буде деактивовано. Дані залу залишаться
          збереженими, а доступ можна буде відновити в будь-який момент.
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