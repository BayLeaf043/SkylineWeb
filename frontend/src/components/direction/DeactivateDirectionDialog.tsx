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

import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";

import type { Direction } from "../../types/direction";

type Props = {
  open: boolean;
  direction: Direction | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeactivateDirectionDialog({
  open,
  direction,
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
            <ExploreOutlinedIcon />
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
            Деактивувати напрямок?
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
          Напрямок{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {direction?.title}
          </Box>{" "}
          буде деактивовано. Дані напрямку залишаться
збереженими, а його можна буде активувати
повторно в будь-який момент.
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